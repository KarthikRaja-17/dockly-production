import json
from root.db.db import postgres  # Import your PostgreSQL connection
from psycopg2.extras import RealDictCursor
from psycopg2 import sql
import psycopg2


class DBHelper:

    @staticmethod
    def insert(table_name, return_column="user_id", **kwargs):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            columns = list(kwargs.keys())
            values = []

            for val in kwargs.values():
                if isinstance(val, dict):
                    # Convert dict to JSON string
                    values.append(json.dumps(val))
                else:
                    values.append(val)

            columns_sql = sql.SQL(", ").join(map(sql.Identifier, columns))
            placeholders = sql.SQL(", ").join(sql.Placeholder() * len(values))

            query = sql.SQL(
                "INSERT INTO {table} ({fields}) VALUES ({values}) RETURNING {returning}"
            ).format(
                table=sql.Identifier(table_name),
                fields=columns_sql,
                values=placeholders,
                returning=sql.Identifier(return_column),
            )

            cur.execute(query, values)
            result = cur.fetchone()
            conn.commit()
            return result[0] if result else None

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def delete_one(table_name, filters):
        """Delete a single record from table based on filters"""
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            if filters:
                where_clause = sql.SQL(" AND ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in filters.keys()
                )
                query = sql.SQL("DELETE FROM {table} WHERE {where}").format(
                    table=sql.Identifier(table_name), where=where_clause
                )
                values = list(filters.values())

                cur.execute(query, values)
                deleted_count = cur.rowcount
                conn.commit()

                return deleted_count > 0
            else:
                return False

        except Exception as e:
            if conn:
                conn.rollback()
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_multi_users(table_queries: dict, user_ids: list, retry=False):
        """
        Enhanced find_multi that can handle multiple user IDs efficiently
        """
        conn = None
        cur = None
        results = {}
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            for table_name, query_data in table_queries.items():
                filters = query_data.get("filters", {})
                select_fields = query_data.get("select_fields")

                if select_fields:
                    columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
                else:
                    columns_sql = sql.SQL("*")

                # Build WHERE conditions
                conditions = []
                params = []

                # Add user_id IN condition
                conditions.append(sql.SQL("user_id = ANY(%s)"))
                params.append(user_ids)

                # Add other filters
                for key, val in filters.items():
                    if key != "user_id":  # Skip user_id as we handle it above
                        conditions.append(
                            sql.SQL("{key} = %s").format(key=sql.Identifier(key))
                        )
                        params.append(val)

                where_clause = sql.SQL(" AND ").join(conditions)

                query = sql.SQL("SELECT {fields} FROM {table} WHERE {where}").format(
                    fields=columns_sql,
                    table=sql.Identifier(table_name),
                    where=where_clause,
                )

                cur.execute(query, params)
                results[table_name] = cur.fetchall()

            return results
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find(table_name, filters=None, select_fields=None, limit=None):
        """Find multiple records"""
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Ensure table_name is string
            table_name = str(table_name)

            # Handle select fields
            if select_fields:
                columns_sql = sql.SQL(", ").join(
                    [sql.Identifier(str(field)) for field in select_fields]
                )
            else:
                columns_sql = sql.SQL("*")

            # Handle filters
            if filters:
                conditions = []
                values = []

                for key, val in filters.items():
                    conditions.append(
                        sql.SQL("{key} = %s").format(key=sql.Identifier(str(key)))
                    )
                    values.append(str(val) if val is not None else None)

                where_clause = sql.SQL(" AND ").join(conditions)
                query_parts = [
                    sql.SQL("SELECT {fields} FROM {table} WHERE {where}").format(
                        fields=columns_sql,
                        table=sql.Identifier(table_name),
                        where=where_clause,
                    )
                ]
            else:
                values = []
                query_parts = [
                    sql.SQL("SELECT {fields} FROM {table}").format(
                        fields=columns_sql, table=sql.Identifier(table_name)
                    )
                ]

            # Add limit if specified
            if limit:
                query_parts.append(sql.SQL(" LIMIT %s"))
                values.append(int(limit))

            query = sql.SQL("").join(query_parts)

            cur.execute(query, values)
            return cur.fetchall()

        except Exception as e:
            print(f"Find error: {str(e)}")
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_one(table_name, filters=None, select_fields=None):
        """Find a single record"""
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Ensure table_name is string
            table_name = str(table_name)

            # Handle select fields
            if select_fields:
                columns_sql = sql.SQL(", ").join(
                    [sql.Identifier(str(field)) for field in select_fields]
                )
            else:
                columns_sql = sql.SQL("*")

            # Handle filters
            if filters:
                conditions = []
                values = []

                for key, val in filters.items():
                    conditions.append(
                        sql.SQL("{key} = %s").format(key=sql.Identifier(str(key)))
                    )
                    values.append(str(val) if val is not None else None)

                where_clause = sql.SQL(" AND ").join(conditions)
            else:
                where_clause = sql.SQL("1=1")
                values = []

            query = sql.SQL(
                "SELECT {fields} FROM {table} WHERE {where} LIMIT 1"
            ).format(
                fields=columns_sql, table=sql.Identifier(table_name), where=where_clause
            )

            cur.execute(query, values)
            return cur.fetchone()

        except Exception as e:
            print(f"Find one error: {str(e)}")
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def update_one(table_name, filters, updates, return_fields=None, operator="AND"):
        """Update a single record with flexible WHERE operator (AND / OR)"""
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Ensure table_name is string
            table_name = str(table_name)

            # --- Build SET clause ---
            set_conditions = []
            set_values = []

            for key, val in updates.items():
                set_conditions.append(
                    sql.SQL("{key} = %s").format(key=sql.Identifier(str(key)))
                )
                set_values.append(
                    json.dumps(val) if isinstance(val, (dict, list)) else val
                )

            set_clause = sql.SQL(", ").join(set_conditions)

            # --- Build WHERE clause ---
            where_conditions = []
            where_values = []

            for key, val in filters.items():
                where_conditions.append(
                    sql.SQL("{key} = %s").format(key=sql.Identifier(str(key)))
                )
                where_values.append(val)

            # Default is AND, but allow OR
            operator = operator.upper()
            if operator not in ("AND", "OR"):
                operator = "AND"

            where_clause = sql.SQL(f" {operator} ").join(where_conditions)

            # --- Handle return fields ---
            if return_fields:
                returning = sql.SQL(", ").join(
                    [sql.Identifier(str(field)) for field in return_fields]
                )
            else:
                returning = sql.SQL("*")

            query = sql.SQL(
                "UPDATE {table} SET {set_clause} WHERE {where_clause} RETURNING {returning}"
            ).format(
                table=sql.Identifier(table_name),
                set_clause=set_clause,
                where_clause=where_clause,
                returning=returning,
            )

            # Combine values
            all_values = set_values + where_values

            cur.execute(query, all_values)
            result = cur.fetchone()
            conn.commit()
            return result

        except Exception as e:
            if conn:
                conn.rollback()
            print(f"Update one error: {str(e)}")
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def update(table_name, filters: dict, update_fields: dict):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            set_clause = ", ".join([f"{key} = %s" for key in update_fields])
            where_clause = " AND ".join([f"{key} = %s" for key in filters])
            values = list(update_fields.values()) + list(filters.values())

            query = f"""
                UPDATE {table_name}
                SET {set_clause}
                WHERE {where_clause}
            """

            cur.execute(query, values)
            conn.commit()
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def update_all(table_name, filters, updates):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            if filters:
                where_clause = sql.SQL(" AND ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in filters.keys()
                )

                set_clause = sql.SQL(", ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in updates.keys()
                )

                query = sql.SQL("UPDATE {table} SET {set} WHERE {where}").format(
                    table=sql.Identifier(table_name), set=set_clause, where=where_clause
                )
                values = list(updates.values()) + list(filters.values())
            else:
                set_clause = sql.SQL(", ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in updates.keys()
                )
                query = sql.SQL("UPDATE {table} SET {set}").format(
                    table=sql.Identifier(table_name), set=set_clause
                )
                values = list(updates.values())

            cur.execute(query, values)
            conn.commit()
            return cur.rowcount  # Return number of affected rows
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)
    
    @staticmethod
    def find_all(table_name, filters=None, select_fields=None, order_by=None, limit=None, offset=None, retry=False):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            if select_fields:
                columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
            else:
                columns_sql = sql.SQL("*")

            query = sql.SQL("SELECT {fields} FROM {table}").format(
                fields=columns_sql,
                table=sql.Identifier(table_name),
            )

            values = []

            if filters:
                where_conditions = []
                for k, v in filters.items():
                    where_conditions.append(sql.SQL("{key} = %s").format(key=sql.Identifier(k)))
                    values.append(v)
                where_clause = sql.SQL(" AND ").join(where_conditions)
                query = sql.SQL(" ").join([query, sql.SQL("WHERE"), where_clause])

            if order_by:
                query = sql.SQL(" ").join([query, sql.SQL("ORDER BY {order_by}").format(order_by=sql.SQL(order_by))])

            if offset is not None:
                query = sql.SQL(" ").join([query, sql.SQL("OFFSET %s")])
                values.append(offset)

            if limit is not None:
                query = sql.SQL(" ").join([query, sql.SQL("LIMIT %s")])
                values.append(limit)

            cur.execute(query, values)
            return cur.fetchall()

        except psycopg2.OperationalError as e:
            if not retry:
                return DBHelper.find_all(table_name, filters, select_fields, order_by, limit, offset, retry=True)
            raise Exception("Database connection failed after retry") from e

        except Exception as e:
            raise e

        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)
    @staticmethod
    def find_in(table_name, select_fields, field, values, extra_filters=None):
        conn = None
        cur = None
        try:
            if not isinstance(values, list):
                values = list(values)

            if values and isinstance(values[0], list):
                values = values[0]

            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))

            # Build WHERE conditions
            conditions = [
                sql.SQL("{field} = ANY(%s)").format(field=sql.Identifier(field))
            ]
            params = [values]

            if extra_filters:
                for key, val in extra_filters.items():
                    conditions.append(
                        sql.SQL("{key} = %s").format(key=sql.Identifier(key))
                    )
                    params.append(val)

            where_clause = sql.SQL(" AND ").join(conditions)

            query = sql.SQL("SELECT {fields} FROM {table} WHERE {where_clause}").format(
                fields=columns_sql,
                table=sql.Identifier(table_name),
                where_clause=where_clause,
            )

            cur.execute(query, tuple(params))
            return cur.fetchall()

        except Exception as e:
            print("Error in find_in:", e)
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def bulk_insert_ignore_duplicates(table_name, rows, unique_key):
        """
        Bulk insert with ON CONFLICT DO NOTHING
        rows: list of dicts, all with the same keys
        """
        if not rows:
            return 0

        conn = None
        cur = None
        try:
            columns = list(rows[0].keys())
            placeholders = ", ".join([f"%s"] * len(columns))
            columns_str = ", ".join(columns)

            values = []
            for row in rows:
                values.append(tuple(row[c] for c in columns))

            sql_query = f"""
                INSERT INTO {table_name} ({columns_str})
                VALUES {", ".join([f"({placeholders})" for _ in values])}
                ON CONFLICT ({unique_key}) DO NOTHING
            """

            flat_values = [v for row in values for v in row]  # flatten list
            conn = postgres.get_connection()
            cur = conn.cursor()
            cur.execute(sql_query, flat_values)
            conn.commit()

            return cur.rowcount
        except Exception as e:
            print("❌ Error in bulk_insert_ignore_duplicates:", e)
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def delete_all(table_name, filters=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            if filters:
                where_clause = sql.SQL(" AND ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in filters.keys()
                )
                query = sql.SQL("DELETE FROM {table} WHERE {where}").format(
                    table=sql.Identifier(table_name), where=where_clause
                )
                values = list(filters.values())
            else:
                query = sql.SQL("DELETE FROM {table}").format(
                    table=sql.Identifier(table_name)
                )
                values = []

            cur.execute(query, values)
            conn.commit()
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_multi(table_queries: dict, retry=False):
        conn = None
        cur = None
        results = {}
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            for table_name, query_data in table_queries.items():
                filters = query_data.get("filters")
                select_fields = query_data.get("select_fields")

                if select_fields:
                    columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))
                else:
                    columns_sql = sql.SQL("*")

                if filters:
                    where_clause = sql.SQL(" AND ").join(
                        sql.Composed(
                            [sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()]
                        )
                        for k in filters.keys()
                    )
                    query = sql.SQL(
                        "SELECT {fields} FROM {table} WHERE {where}"
                    ).format(
                        fields=columns_sql,
                        table=sql.Identifier(table_name),
                        where=where_clause,
                    )
                    cur.execute(query, list(filters.values()))
                else:
                    query = sql.SQL("SELECT {fields} FROM {table}").format(
                        fields=columns_sql,
                        table=sql.Identifier(table_name),
                    )
                    cur.execute(query)

                results[table_name] = cur.fetchall()

            return results
        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def count(table_name, filters=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor()

            if filters:
                where_clause = sql.SQL(" AND ").join(
                    sql.Composed([sql.Identifier(k), sql.SQL(" = "), sql.Placeholder()])
                    for k in filters.keys()
                )
                query = sql.SQL("SELECT COUNT(*) FROM {table} WHERE {where}").format(
                    table=sql.Identifier(table_name), where=where_clause
                )
                values = list(filters.values())
            else:
                query = sql.SQL("SELECT COUNT(*) FROM {table}").format(
                    table=sql.Identifier(table_name)
                )
                values = []

            cur.execute(query, values)
            result = cur.fetchone()
            return result[0] if result else 0

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def raw_sql(query, params=None):
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            if params:
                cur.execute(query, params)
            else:
                cur.execute(query)

            return cur.fetchall()

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)

    @staticmethod
    def find_with_or_and_array_match(
        table_name, select_fields, uid, array_field, filters=None, or_field="user_id"
    ):
        """
        Finds records where `or_field` = uid OR uid is in array_field (e.g., tagged_ids)
        Also supports additional AND filters like category, is_active, etc.

        :param table_name: Table name
        :param select_fields: List of columns to fetch
        :param uid: Logged in user's ID
        :param array_field: Array column name (e.g., tagged_ids)
        :param filters: Optional dict of AND filters (e.g., {"is_active": True})
        :param or_field: Field name for direct UID match (default = "user_id")
        """
        conn = None
        cur = None
        try:
            conn = postgres.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            columns_sql = sql.SQL(", ").join(map(sql.Identifier, select_fields))

            # OR condition: (or_field = uid OR uid = ANY(array_field))
            conditions = [
                sql.SQL("({field} = %s OR %s = ANY({array_field}))").format(
                    field=sql.Identifier(or_field),
                    array_field=sql.Identifier(array_field),
                )
            ]
            params = [uid, uid]

            # Additional filters (AND conditions)
            if filters:
                for key, val in filters.items():
                    conditions.append(
                        sql.SQL("{key} = %s").format(key=sql.Identifier(key))
                    )
                    params.append(val)

            where_clause = sql.SQL(" AND ").join(conditions)

            query = sql.SQL("SELECT {fields} FROM {table} WHERE {where}").format(
                fields=columns_sql,
                table=sql.Identifier(table_name),
                where=where_clause,
            )

            cur.execute(query, params)
            return cur.fetchall()

        except Exception as e:
            raise e
        finally:
            if cur:
                cur.close()
            if conn:
                postgres.release_connection(conn)
