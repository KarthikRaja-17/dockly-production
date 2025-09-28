import psycopg2
from psycopg2 import sql, pool
from root.config import (
    POSTGRES_URI,
    WISHLIST_POSTGRES_URI,
)  # Make sure this is defined properly
import json
import os


class PostgreSQL:
    def __init__(self, dsn=None):
        self.dsn = dsn
        self.connection_pool = None

    def init_app(self):
        """Initialize the PostgreSQL connection pool."""
        if not self.connection_pool:
            try:
                self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                    minconn=1, maxconn=10, dsn=self.dsn
                )
                print(f"✅ Connection pool created for: {self.dsn}")
            except Exception as e:
                print(f"❌ Failed to create Postgres connection pool: {e}")
                self.connection_pool = None  # Reset if failed

    def get_connection(self):
        if not self.connection_pool:
            raise Exception("Connection pool is not initialized")
        return self.connection_pool.getconn()

    def release_connection(self, conn):
        if self.connection_pool and conn:
            self.connection_pool.putconn(conn)

    def close_all_connections(self):
        if self.connection_pool:
            self.connection_pool.closeall()


# ✅ Initialize two separate Postgres instances with different URIs
postgres = PostgreSQL(POSTGRES_URI)
postgres_wishlist = PostgreSQL(WISHLIST_POSTGRES_URI)


def get_postgres_instance(user_type="app"):
    """Get the appropriate PostgreSQL instance based on user type"""
    if user_type == "waitlist" and WISHLIST_POSTGRES_URI:
        if not postgres_wishlist.connection_pool:
            postgres_wishlist.init_app()
        return postgres_wishlist
    else:
        if not postgres.connection_pool:
            postgres.init_app()
        return postgres


def init_tables_from_json():
    json_path = os.path.join(os.path.dirname(__file__), "tables.json")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    tables = data.get("tables", [])
    created = []
    errors = []

    conn = None
    cur = None

    try:
        # Initialize the connection pool if not already initialized
        if not postgres.connection_pool:
            postgres.init_app()

        conn = postgres.get_connection()
        cur = conn.cursor()

        for table in tables:
            table_name = table.get("table_name")
            columns = table.get("columns")

            if not table_name or not columns:
                errors.append(f"Missing data for one table: {table}")
                continue

            try:
                create_query = sql.SQL("CREATE TABLE IF NOT EXISTS {} ({});").format(
                    sql.Identifier(table_name),
                    sql.SQL(", ").join(sql.SQL(col) for col in columns),
                )
                cur.execute(create_query)
                created.append(table_name)
            except Exception as table_err:
                errors.append({table_name: str(table_err)})

        conn.commit()
    except Exception as e:
        return {"error": str(e), "created_tables": created, "errors": errors}
    finally:
        if cur:
            cur.close()
        if conn:
            postgres.release_connection(conn)

    return {"created_tables": created, "errors": errors}


def upload_static_data_from_json():
    json_path = os.path.join(os.path.dirname(__file__), "staticData.json")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    inserted = []
    errors = []

    conn = None
    cur = None

    try:
        if not postgres.connection_pool:
            postgres.init_app()

        conn = postgres.get_connection()
        cur = conn.cursor()

        for table_name, rows in data.items():
            if not isinstance(rows, list) or not rows:
                continue

            for row in rows:
                try:
                    columns = row.keys()
                    values = [row[col] for col in columns]

                    insert_query = sql.SQL(
                        "INSERT INTO {} ({}) VALUES ({}) ON CONFLICT DO NOTHING"
                    ).format(
                        sql.Identifier(table_name),
                        sql.SQL(", ").join(map(sql.Identifier, columns)),
                        sql.SQL(", ").join(sql.Placeholder() * len(values)),
                    )
                    cur.execute(insert_query, values)
                    inserted.append({table_name: row})
                except Exception as e:
                    errors.append({table_name: str(e)})

        conn.commit()
    except Exception as e:
        # return {"error": str(e), "inserted_rows": inserted, "errors": errors}
        return {"inserted_rows": len(inserted), "errors": errors}
    finally:
        if cur:
            cur.close()
        if conn:
            postgres.release_connection(conn)

    return {"inserted_rows": 1, "errors": errors}





