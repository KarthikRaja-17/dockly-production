
import base64
from collections import Counter, defaultdict

# import datetime
from datetime import datetime, date
from decimal import Decimal
import json
import statistics
import time
from venv import logger

from yaml import safe_load # type: ignore
from root.db.dbHelper import DBHelper
import logging
from flask import request
from flask_restful import Resource, reqparse
import requests

from root.config import API_SECRET_KEY, AUTH_ENDPOINT
from root.auth.auth import auth_required
import random

API_SECRET_KEY = (
    "qltt_04b9cfce7233a7d46d38f12d4d51e4b3497aa5e4e4c391741d3c7df0d775874b7dd8a0f2d"
)


def uniqueId(digit=15, isNum=True):
    if isNum:
        return "".join([str(random.randint(0, 9)) for _ in range(digit)])
    else:
        chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        return "".join(random.choice(chars) for _ in range(digit))


GRAPHQL_ENDPOINT = "https://api.quiltt.io/v1/graphql"


class BankConnect(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json()
        currentUser = data.get("currentUser")
        userId = currentUser.get("uid")
        email = currentUser.get("email")
        # email = "dockly3@gmail.com" # for testing

        if not userId:
            return {"error": "Missing userId"}

        existing_user = DBHelper.find_one(
            "user_finance_details",
            filters={"user_id": uid},
            select_fields=["profile_id", "isfinanceuser"],
        )

        if existing_user:
            profile_id = existing_user.get("profile_id")

            response = requests.post(
                "https://auth.quiltt.io/v1/users/sessions",
                headers={
                    "Authorization": f"Bearer {API_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                json={"userId": profile_id},
            )

            if response.status_code in [200, 201, 202]:
                result = response.json()
                return {
                    "uid": existing_user.get("uid"),
                    "token": result.get("token"),
                    "userId": result.get("userId"),
                    "expiresAt": result.get("expiresAt"),
                    "is_finance_user": True,
                }
            else:
                error_data = response.json()
                return {
                    "error": error_data.get("message", "Authentication failed")
                }, response.status_code
        else:
            response = requests.post(
                "https://auth.quiltt.io/v1/users/sessions",
                headers={
                    "Authorization": f"Bearer {API_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                json={"email": email},
            )

            if response.status_code in [200, 201, 202]:
                result = response.json()
                token = result.get("token")
                profile_id = result.get("userId")
                expires_at = result.get("expiresAt")

                userId = DBHelper.insert(
                    "user_finance_details",
                    return_column="user_id",
                    user_id=uid,
                    expiresat=expires_at,
                    profile_id=profile_id,
                    isfinanceuser=1,
                )

                return {
                    "uid": userId,
                    "token": token,
                    "profile_id": profile_id,
                    "expiresAt": expires_at,
                    "is_finance_user": True,
                }
            else:
                error_data = response.json()
                print("Quiltt API error:", error_data)
                return {
                    "error": error_data.get("message", "Authentication failed")
                }, response.status_code


query = """
query SpendingAccountsWithTransactionsQuery {
  connections {
    id
    status
    institution {
      id
      name
      logo {
        url
      }
    }
    accounts(sort: LAST_TRANSACTED_ON_ASC) {
      balance {
        at
        current
        id
        available
        source
      }
      currencyCode
      name
      id
      provider
      transactedFirstOn
      transactedLastOn
      verified
    }
    features
    externallyManaged
  }
  transactions {
    nodes {
      id
      date
      description
      amount
      status
      currencyCode
      entryType

      remoteData {
        mx {
          transaction {
            timestamp
            response {
              id
            }
          }
        }
        fingoal {
          enrichment {
            id
            timestamp
            response {
              accountid
              amountnum
              category
              categoryId
              clientId
              container
              date
              detailCategoryId
              guid
              highLevelCategoryId
              isPhysical
              isRecurring
              merchantAddress1
              merchantCity
              merchantCountry
              merchantLatitude
              merchantLogoUrl
              merchantLongitude
              merchantName
              merchantPhoneNumber
              merchantState
              merchantType
              merchantZip
              originalDescription
              type
              transactionid
              transactionTags
              subType
              simpleDescription
              receiptDate
              requestId
              sourceId
              uid
            }
          }
        }
        finicity {
          transaction {
            id
            timestamp
            response {
              accountId
              amount
              checkNum
              commissionAmount
              createdDate
              currencySymbol
              customerId
              description
              effectiveDate
              escrowAmount
              feeAmount
              firstEffectiveDate
              id
              incomeType
              investmentTransactionType
              interestAmount
            }
          }
        }
      }
    }
  }
}
"""


class GetBankAccount(Resource):
    def post(self):
        data = request.get_json()
        session = data.get("session")
        token = session.get("token") if session else None
        if not token:
            return {"error": "Missing Authorization header"}, 401

        try:
            data = getBankData(token)
            return data
        except TimeoutError:
            return {
                "status": "PENDING",
                "message": "Still syncing, try again shortly",
            }, 202


class SaveBankAccount(Resource):
    def post(self):
        data = request.get_json()


def getBankData(token):
    headers = {
        "Authorization": token,
        "Content-Type": "application/json",
    }

    response = requests.post(GRAPHQL_ENDPOINT, json={"query": query}, headers=headers)

    data = response.json()
    # print(f"data: {data}")
    return data


def wait_for_balances(token, timeout=10, max_sleep=4):
    start = time.time()
    sleep = 1
    while time.time() - start < timeout:
        data = getBankData(token)
        conn = data["data"]["connections"][0]
        status = conn["status"]
        accounts = conn.get("accounts", [])
        has_balances = any(
            a.get("balance") and a["balance"].get("current") is not None
            for a in accounts
        )
        if status != "SYNCING" and has_balances:
            return data

        time.sleep(sleep)
        sleep = min(max_sleep, sleep * 2)
    return {"status": "PENDING", "message": "Still syncing, try again shortly"}


logger = logging.getLogger(__name__)

BUDGET_CATEGORIES = ["Savings", "Wants", "Needs", "Others"]


BUDGET_CATEGORIES = ["Savings", "Wants", "Needs", "Others"]

DESCRIPTION_TO_CATEGORY = {
    "Savings Transfer from Checking": "Savings",
    "Loan Payment": "Savings",
    "Transfer to Savings": "Savings",
    "Mortgage Payment": "Savings",
    "Wells Fargo Mortgage": "Savings",
    "Paycheck": "Savings",
    "Credit Card Payment": "Savings",
    "Transfer": "Wants",
    "Netflix": "Wants",
    "Wendy’s": "Wants",
    "El Torito Grill": "Wants",
    "Toys R Us": "Wants",
    "Pizza Hut": "Wants",
    "Old Navy": "Wants",
    "In-N-Out Burger": "Wants",
    "Payment": "Wants",
    "Bath & Body Works": "Wants",
    "Sports Authority": "Wants",
    "Big Bob’s Burgers": "Wants",
    "Donation": "Wants",
    "Apple iTunes": "Wants",
    "Best Buy": "Wants",
    "Fee": "Needs",
    "Late Fee": "Needs",
    "Interest Charge": "Needs",
    "ExxonMobil": "Needs",
    "United Healthcare": "Needs",
    "Lowe’s": "Needs",
    "Gold’s Gym": "Needs",
    "Comcast": "Needs",
    "Children’s Hospital": "Needs",
    "Ralph’s": "Needs",
    "Transfer From Savings": "Others",
    "IRA credit 219": "Savings",
    "SAVINGS debit 229": "Others",
    "SAVINGS debit 232": "Needs",
    "REMOTE ONLINE DEPOSIT": "Savings",
    "Autoloan credit 202": "Wants",
    # Housing-related (Needs)
    "mortgage": "Needs",
    "MORTGAGE PAYMENT": "Needs",
    "rent": "Needs",
    "housing": "Needs",
    # Food-related (reclassified as Dining Out under Wants)
    "groceries": "Wants",  # Reclassified to Dining Out
    "food": "Wants",  # Reclassified to Dining Out
    # Entertainment-related (Wants)
    "subscriptions": "Wants",
    "movie tickets": "Wants",
    "entertainment": "Wants",
    # Shopping-related (Wants)
    "electronics": "Wants",
    "shoes": "Wants",
    "clothing": "Wants",
    "cables": "Wants",
    "healthcare": "Wants",
    # Savings
    "savings": "Savings",
    "transfer to savings": "Savings",
    # Other
    "fee": "Needs",
    "service charge": "Others",
    "income": "Savings",
    "paycheck": "Others",
    "transfer": "Others",
    "CHECKING debit 230": "Needs",
    "ROCKET SURGERY PAYROLL": "Wants",
    "Transfer To Savings": "Savings",
    "MORTGAGE PAYMENT": "Needs",
    "Account": "Others",
    # "transfer to savings":"Savings",
    "Transfer to SAVINGS": "Savings"
}


def compute_budget(transactions):
    from collections import defaultdict
    from decimal import Decimal

    summary = defaultdict(lambda: {"spent": 0.0, "count": 0})
    all_transactions = defaultdict(list)

    for txn in transactions:
        budget_cat = txn.get("categoryname", "Others")
        if budget_cat not in BUDGET_CATEGORIES:
            budget_cat = "Others"

        amount = float(txn.get("amount", 0)) if isinstance(txn.get("amount"), Decimal) else float(txn.get("amount", 0))
        amount = abs(amount)

        summary[budget_cat]["spent"] += amount
        summary[budget_cat]["count"] += 1
        all_transactions[budget_cat].append(
            {
                "transaction_id": txn.get("transaction_id", ""),
                "description": txn.get("description", "Unknown"),
                "amount": amount,
                "categoryname": budget_cat,
                "category": txn.get("category", "Unknown"),
                "date": txn.get("date", "N/A"),
            }
        )

    for cat in BUDGET_CATEGORIES:
        if cat not in summary:
            summary[cat] = {"spent": 0.0, "count": 0}
        summary[cat]["budget"] = round(summary[cat]["spent"] * 1.2, 2)

    budget_categories = {
        cat: {
            "spent": round(summary[cat]["spent"], 2),
            "budget": round(summary[cat]["budget"], 2),
            "count": summary[cat]["count"],
            "transactions": all_transactions[cat],
        }
        for cat in BUDGET_CATEGORIES
    }

    spending_by_category = [
        {"name": "Housing", "spent": round(summary["Needs"]["spent"] * 0.4, 2), "budget": round(summary["Needs"]["budget"] * 0.4, 2), "type": "Needs", "icon": "Home"},
        {"name": "Groceries", "spent": round(summary["Needs"]["spent"] * 0.3, 2), "budget": round(summary["Needs"]["budget"] * 0.3, 2), "type": "Needs", "icon": "ShoppingCart"},
        {"name": "Transport", "spent": round(summary["Needs"]["spent"] * 0.3, 2), "budget": round(summary["Needs"]["budget"] * 0.3, 2), "type": "Needs", "icon": "Car"},
        {"name": "Dining Out", "spent": round(summary["Wants"]["spent"] * 0.3, 2), "budget": round(summary["Wants"]["budget"] * 0.3, 2), "type": "Wants", "icon": "Utensils"},
        {"name": "Shopping", "spent": round(summary["Wants"]["spent"] * 0.4, 2), "budget": round(summary["Wants"]["budget"] * 0.4, 2), "type": "Wants", "icon": "ShoppingBag"},
        {"name": "Subscriptions", "spent": round(summary["Wants"]["spent"] * 0.3, 2), "budget": round(summary["Wants"]["budget"] * 0.3, 2), "type": "Wants", "icon": "Smartphone"},
        {"name": "Emergency", "spent": round(summary["Savings"]["spent"] * 0.4, 2), "budget": round(summary["Savings"]["budget"] * 0.4, 2), "type": "Savings", "icon": "Shield"},
        {"name": "Investments", "spent": round(summary["Savings"]["spent"] * 0.3, 2), "budget": round(summary["Savings"]["budget"] * 0.3, 2), "type": "Savings", "icon": "TrendingUp"},
        {"name": "Goals", "spent": round(summary["Savings"]["spent"] * 0.3, 2), "budget": round(summary["Savings"]["budget"] * 0.3, 2), "type": "Savings", "icon": "Target"},
    ]

    return {
        "budget_categories": budget_categories,
        "budget_summary": {
            cat: {"spent": summary[cat]["spent"], "total": summary[cat]["budget"]}
            for cat in BUDGET_CATEGORIES
        },
        "spending_by_category": spending_by_category,
    }

class SaveBankTransactions(Resource):
    def post(self):
        try:
            data = request.get_json(force=True) or {}
            session = data.get("session") or {}
            user_id = data.get("user_id")

            if not session.get("token"):
                return {"status": 0, "error": "Missing session or token"}, 400
            if not user_id:
                return {"status": 0, "error": "Missing user_id"}, 400

            token = session["token"]
            result = wait_for_balances(token)

            if result.get("status") == "PENDING":
                return {"status": 0, "message": "Still syncing, try again shortly"}, 202

            if "errors" in result:
                return {"status": 0, "error": result["errors"]}, 400

            transactions = (
                result.get("data", {})
                      .get("transactions", {})
                      .get("nodes") or []
            )
            if not isinstance(transactions, list):
                transactions = []

            if not DBHelper.find_one("users", filters={"uid": user_id}):
                DBHelper.insert("users", uid=user_id)

            # prepare rows
            rows = []
            for txn in transactions:
                description = (txn.get("description") or "").lower()
                fingoal = (
                    txn.get("remoteData", {})
                       .get("fingoal", {})
                       .get("enrichment", {})
                       .get("response", {}) or {}
                )
                fingoal_category = fingoal.get("category")

                categoryname = "Others"
                for key, cat in DESCRIPTION_TO_CATEGORY.items():
                    if key.lower() in description:
                        categoryname = cat if cat in BUDGET_CATEGORIES else "Others"
                        break

                rows.append({
                    "user_id": user_id,
                    "transaction_id": txn.get("id"),
                    "date": txn.get("date"),
                    "description": txn.get("description"),
                    "amount": txn.get("amount", 0),
                    "status": txn.get("status"),
                    "currency_code": txn.get("currencyCode"),
                    "entry_type": txn.get("entryType"),
                    "account": txn.get("account") or "Account",
                    "category": fingoal_category or categoryname,
                    "categoryname": categoryname,
                    "merchantname": (txn.get("description") or "Unknown").split(" ")[0],
                    "isrecurring": fingoal.get("isRecurring", "no"),
                    "created_at": str(datetime.now()),
                    "updated_at": str(datetime.now()),
                })

            # bulk insert
            saved = DBHelper.bulk_insert_ignore_duplicates(
                "user_bank_transactions", rows, unique_key="transaction_id"
            )

            # ✅ compute budget directly from rows
            budget_data = compute_budget(rows)
            
            # print(f"Budget data: {budget_data}")

            return {
                "status": 1,
                "message": "Transactions saved & budget generated successfully",
                "count": saved,
                **budget_data
            }, 200

        except Exception as e:
            logger.exception("Internal error in SaveBankTransactions")
            return {"status": 0, "error": "Internal server error"}, 500




class RecurringTransactions(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            uid = request.args.get("uid") or uid
            if not uid:
                return {"error": "Missing user_id"}, 400

            transactions = DBHelper.find_all(
                table_name="user_bank_transactions",
                filters={"user_id": uid, "isrecurring": "yes"},
                select_fields=[
                    "transaction_id",
                    "date",
                    "description",
                    "amount",
                    "status",
                    "currency_code",
                    "entry_type",
                    "isrecurring",
                    "merchantname"
                ]
            ) or []

            # Transform data to match frontend expectations
            recurring_transactions = [
                {
                    "transaction_id": txn["transaction_id"],
                    "description": txn["description"],
                    "amount": float(txn["amount"]),
                    "last_date": txn["date"].strftime("%Y-%m-%d") if txn["date"] else None,
                    "frequency": "Monthly",  # Adjust based on actual logic to determine frequency
                    "merchant": txn.get("merchantname", "Unknown")
                }
                for txn in transactions
            ]

            return {
                "status": 1,
                "message": "Recurring transactions retrieved successfully",
                "recurring_transactions": recurring_transactions
            }, 200

        except Exception as e:
            logging.error(f"Error fetching recurring transactions for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"},500





class AddAccounts(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json()

        accounts = input_data.get("accounts", [])
        # print(f"accounts: {accounts}")

        # ✅ 1. Delete existing accounts for the user
        DBHelper.delete_all("bank_accounts", filters={"user_id": uid})

        # ✅ 2. Insert new accounts
        inserted_ids = []
        for acc in accounts:
            account_id = DBHelper.insert(
                "bank_accounts",
                return_column="id",
                user_id=uid,
                name=acc.get("name"),
                provider=acc.get("provider"),
                access_token=acc.get("session", {}).get("token"),
                current_balance=acc.get("balance", {}).get("current"),
                currency=acc.get("currencyCode"),
                transacted_first=acc.get("transactedFirstOn"),
                transacted_last=acc.get("transactedLastOn"),
            )
            inserted_ids.append(account_id)

        return {
            "status": 1,
            "message": "Accounts refreshed successfully",
            "account_ids": inserted_ids,
        }


class GetAccounts(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        accounts = DBHelper.find_all(
            "bank_accounts",
            filters={"user_id": uid},
            select_fields=[
                "id",
                "name",
                "provider",
                "current_balance",
                "currency",
                "transacted_first",
                "transacted_last",
            ],
        )

        def classify(acc):
            name = (acc.get("name") or "").lower()
            provider = (acc.get("provider") or "").lower()

            if (
                "loan" in name
                or "loan" in provider
                or "mortgage" in name
                or "mortgage" in provider
            ):
                return "Loans"
            elif (
                "credit" in name
                or "card" in provider
                or "amex" in provider
                or "visa" in provider
            ):
                return "Credit Cards"
            elif (
                "investment" in name
                or "401" in name
                or "fidelity" in provider
                or "vanguard" in provider
            ):
                return "Investments"
            else:
                return "Cash Accounts"

        COLOR_MAP = {
            "Loans": "#ef4444",
            "Credit Cards": "#1e40af",
            "Investments": "#8b5cf6",
            "Cash Accounts": "#3b82f6",
        }

        sections = {}

        for acc in accounts:
            section = classify(acc)
            balance = float(acc["current_balance"] or 0)
            item = {
                "name": acc["name"],
                "type": acc["provider"],
                "value": balance,
                "color": COLOR_MAP.get(section, "#3b82f6"),
            }

            if section not in sections:
                sections[section] = {
                    "title": section,
                    "total": 0,
                    "items": [],
                }
            sections[section]["total"] += balance
            sections[section]["items"].append(item)

        assets = sum(
            float(acc["current_balance"] or 0)
            for acc in accounts
            if float(acc["current_balance"] or 0) >= 0
        )
        liabilities = sum(
            abs(float(acc["current_balance"] or 0))
            for acc in accounts
            if float(acc["current_balance"] or 0) < 0
        )

        ordered_titles = ["Cash Accounts", "Credit Cards", "Investments", "Loans"]
        ordered_sections = [
            sections[title] for title in ordered_titles if title in sections
        ]

        return {
            "status": 1,
            "message": "Accounts grouped",
            "payload": {
                "sections": ordered_sections,
                "total_balance": assets - liabilities,
                "assets": assets,
                "liabilities": liabilities,
            },
        }


class GetTotalBalance(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        accounts = DBHelper.find_all(
            "bank_accounts",
            filters={"user_id": uid},
            select_fields=[
                "id",
                "current_balance",
            ],
        )

        assets = sum(
            float(acc["current_balance"] or 0)
            for acc in accounts
            if float(acc["current_balance"] or 0) >= 0
        )
        liabilities = sum(
            abs(float(acc["current_balance"] or 0))
            for acc in accounts
            if float(acc["current_balance"] or 0) < 0
        )

        # print(f"Assets for user {uid}: {assets}")
        # print(f"Liabilities for user {uid}: {liabilities}")

        return {
            "status": 1,
            "message": "Account balances retrieved",
            "assets": assets,
            "liabilities": liabilities,
            "total_balance": assets - liabilities,
        }

# Modified UpdateRecurringStatus for batch updates


class UpdateRecurringStatus(Resource):
    @auth_required(isOptional=True)
    def put(self, uid=None, user=None):
        try:
            data = request.get_json()
            uid = data.get('uid') or uid
            updates = data.get('updates')  # Expecting [{ transaction_id, is_recurring }, ...]
            if not uid:
                return {"error": "Missing user_id"}, 400
            if not updates or not isinstance(updates, list):
                return {"error": "Missing or invalid updates array"}, 400

            for update in updates:
                transaction_id = update.get('transaction_id')
                is_recurring = update.get('is_recurring')
                if not transaction_id or is_recurring not in ['yes', 'no']:
                    continue  # Skip invalid entries

                existing_transaction = DBHelper.find_one(
                    table_name="user_bank_transactions",
                    filters={"user_id": uid, "transaction_id": transaction_id},
                    select_fields=["id"]
                )
                if not existing_transaction:
                    continue  # Skip non-existent transactions

                DBHelper.update_one(
                    table_name="user_bank_transactions",
                    filters={"user_id": uid, "transaction_id": transaction_id},
                    updates={
                        "isrecurring": is_recurring,
                        "updated_at": datetime.now()
                    }
                )

            logging.info(f"Batch updated recurring status for user {uid}")
            return {
                "status": 1,
                "message": "Recurring status updated for transactions"
            }, 200

        except Exception as e:
            logging.error(f"Error updating recurring status for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"},500


        
        
class GetIncomeExpense(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        transactions = DBHelper.find_all(
            table_name="user_bank_transactions",
            filters={"user_id": uid},
            select_fields=["amount"],
        )

        income_total = 0.0
        expense_total = 0.0

        for txn in transactions:
            amount = txn.get("amount")
            if isinstance(amount, Decimal):
                amount = float(amount)

            if amount is not None:
                if amount >= 0:
                    income_total += amount
                else:
                    expense_total += abs(amount)
        print(f"Income total: {income_total}, Expense total: {expense_total}")
        return {
            "income_total": income_total,
            "expense_total": expense_total,
        }


# New classes for finance goals
class AddFinanceGoal(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        # Required fields
        required_fields = ["name", "saved_percentage", "target_percentage"]
        for field in required_fields:
            if field not in input_data or input_data[field] is None:
                return {"status": 0, "message": f"{field.capitalize()} is required", "payload": {}}

        try:
            saved_percentage = float(input_data["saved_percentage"])
            target_percentage = float(input_data["target_percentage"])
            if saved_percentage < 0 or target_percentage < 0:
                return {
                    "status": 0,
                    "message": "Percentage values must be non-negative",
                    "payload": {},
                }
        except (ValueError, TypeError):
            return {
                "status": 0,
                "message": "Invalid number format for percentages",
                "payload": {},
            }

        # Optional fields
        saved_amount = None
        target_amount = None
        if "saved_amount" in input_data and input_data["saved_amount"] is not None:
            try:
                saved_amount = float(input_data["saved_amount"])
                if saved_amount < 0:
                    return {
                        "status": 0,
                        "message": "Saved amount must be non-negative",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid saved amount format",
                    "payload": {},
                }

        if "target_amount" in input_data and input_data["target_amount"] is not None:
            try:
                target_amount = float(input_data["target_amount"])
                if target_amount < 0:
                    return {
                        "status": 0,
                        "message": "Target amount must be non-negative",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid target amount format",
                    "payload": {},
                }

        # Handle deadline safely
        deadline = input_data.get("deadline")
        if deadline is not None and isinstance(deadline, str):
            deadline = deadline.strip() or None

        goal_data = {
            "user_id": uid,
            "name": input_data["name"].strip(),
            "saved_percentage": saved_percentage,
            "target_percentage": target_percentage,
            "saved_amount": saved_amount,
            "target_amount": target_amount,
            "goal_status": input_data.get("goal_status", 0),
            "deadline": deadline,
            "is_active": input_data.get("is_active", 1),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        try:
            inserted_id = DBHelper.insert(
                "user_finance_goals", return_column="id", **goal_data
            )
            goal_data["id"] = inserted_id
            return {
                "status": 1,
                "message": "Finance Goal Added Successfully",
                "payload": {"goal": goal_data},
            }
        except Exception as e:
            logger.error(f"Error adding finance goal: {str(e)}")
            return {
                "status": 0,
                "message": f"Error adding finance goal: {str(e)}",
                "payload": {},
            }

class GetFinanceGoals(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            is_active = int(request.args.get("is_active", 1))
            filters = {"user_id": uid, "is_active": is_active} if uid else {"is_active": is_active}

            goals = DBHelper.find_all(
                "user_finance_goals",
                filters=filters,
                select_fields=[
                    "id",
                    "user_id",
                    "name",
                    "saved_percentage",
                    "target_percentage",
                    "saved_amount",
                    "target_amount",
                    "goal_status",
                    "deadline",
                    "is_active",
                    "created_at",
                    "updated_at",
                ],
            ) or []

            formatted_goals = []
            for goal in goals:
                formatted_goal = {
                    "id": goal["id"],
                    "user_id": goal["user_id"],
                    "name": goal["name"],
                    "saved_percentage": float(goal["saved_percentage"]) if goal["saved_percentage"] is not None else 0.0,
                    "target_percentage": float(goal["target_percentage"]) if goal["target_percentage"] is not None else 0.0,
                    "saved_amount": float(goal["saved_amount"]) if goal["saved_amount"] is not None else None,
                    "target_amount": float(goal["target_amount"]) if goal["target_amount"] is not None else None,
                    "goal_status": goal["goal_status"],
                    "deadline": goal["deadline"],
                    "is_active": goal["is_active"],
                    "created_at": goal["created_at"].isoformat() if goal["created_at"] else None,
                    "updated_at": goal["updated_at"].isoformat() if goal["updated_at"] else None,
                }
                formatted_goals.append(formatted_goal)

            logger.info(f"Fetched {len(formatted_goals)} finance goals for user {uid}")
            return {
                "status": 1,
                "message": "Finance goals retrieved successfully",
                "payload": {"goals": formatted_goals},
            }
        except Exception as e:
            logger.error(f"Error fetching finance goals for user {uid}: {str(e)}")
            return {
                "status": 0,
                "message": f"Error fetching finance goals: {str(e)}",
                "payload": {"goals": []},
            }, 500
class UpdateFinanceGoal(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user, goal_id):
        input_data = request.get_json(silent=True)
        if not input_data:
            return {"status": 0, "message": "No input data received", "payload": {}}

        updates = {}
        if "name" in input_data and input_data["name"] is not None and input_data["name"].strip():
            updates["name"] = input_data["name"].strip()
        if "saved_percentage" in input_data and input_data["saved_percentage"] is not None:
            try:
                updates["saved_percentage"] = float(input_data["saved_percentage"])
                if updates["saved_percentage"] < 0:
                    return {
                        "status": 0,
                        "message": "Saved percentage must be non-negative",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid saved percentage format",
                    "payload": {},
                }
        if "target_percentage" in input_data and input_data["target_percentage"] is not None:
            try:
                updates["target_percentage"] = float(input_data["target_percentage"])
                if updates["target_percentage"] < 0:
                    return {
                        "status": 0,
                        "message": "Target percentage must be non-negative",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid target percentage format",
                    "payload": {},
                }
        if "saved_amount" in input_data and input_data["saved_amount"] is not None:
            try:
                updates["saved_amount"] = float(input_data["saved_amount"])
                if updates["saved_amount"] < 0:
                    return {
                        "status": 0,
                        "message": "Saved amount must be non-negative",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid saved amount format",
                    "payload": {},
                }
        if "target_amount" in input_data and input_data["target_amount"] is not None:
            try:
                updates["target_amount"] = float(input_data["target_amount"])
                if updates["target_amount"] < 0:
                    return {
                        "status": 0,
                        "message": "Target amount must be non-negative",
                        "payload": {},
                    }
            except (ValueError, TypeError):
                return {
                    "status": 0,
                    "message": "Invalid target amount format",
                    "payload": {},
                }
        if "goal_status" in input_data and input_data["goal_status"] is not None:
            updates["goal_status"] = input_data["goal_status"]
        if "deadline" in input_data:
            deadline = input_data["deadline"]
            updates["deadline"] = deadline.strip() if isinstance(deadline, str) else None
        if "is_active" in input_data and input_data["is_active"] is not None:
            updates["is_active"] = input_data["is_active"]
        updates["updated_at"] = datetime.now().isoformat()

        if not updates:
            return {"status": 0, "message": "No valid updates provided", "payload": {}}

        try:
            result = DBHelper.update_one(
                table_name="user_finance_goals",
                filters={"id": int(goal_id), "user_id": uid},
                updates=updates,
                return_fields=[
                    "id",
                    "name",
                    "saved_percentage",
                    "target_percentage",
                    "saved_amount",
                    "target_amount",
                    "goal_status",
                    "deadline",
                    "is_active",
                    "created_at",
                    "updated_at",
                ],
            )
            if result:
                updated_goal = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "saved_percentage": float(result["saved_percentage"]),
                    "target_percentage": float(result["target_percentage"]),
                    "saved_amount": float(result["saved_amount"]) if result["saved_amount"] is not None else None,
                    "target_amount": float(result["target_amount"]) if result["target_amount"] is not None else None,
                    "goal_status": result["goal_status"],
                    "deadline": (
                        result["deadline"].strftime("%Y-%m-%d")
                        if result["deadline"]
                        else None
                    ),
                    "is_active": result["is_active"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                }
                return {
                    "status": 1,
                    "message": "Finance Goal Updated Successfully",
                    "payload": {"goal": updated_goal},
                }
            else:
                return {
                    "status": 0,
                    "message": "Goal not found or not authorized",
                    "payload": {},
                }
        except Exception as e:
            logger.error(f"Error updating finance goal: {str(e)}")
            return {
                "status": 0,
                "message": f"Error updating finance goal: {str(e)}",
                "payload": {},
            }





class DeleteFinanceGoal(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user, goal_id):
        logger.debug(f"Attempting to delete finance goal: id={goal_id}, user_id={uid}")
        try:
            try:
                goal_id_int = int(goal_id)
            except ValueError:
                logger.error(f"Invalid goal_id format: {goal_id}")
                return {
                    "status": 0,
                    "message": "Invalid goal_id format, must be a valid integer",
                    "payload": {},
                }, 400

            goal = DBHelper.find_one(
                table_name="user_finance_goals",
                filters={"id": goal_id_int, "user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "saved_percentage",
                    "target_percentage",
                    "saved_amount",
                    "target_amount",
                    "goal_status",
                    "deadline",
                    "is_active",
                    "created_at",
                    "updated_at",
                ],
            )
            if not goal:
                logger.warning(f"Finance goal not found or already inactive: id={goal_id}, user_id={uid}")
                return {
                    "status": 0,
                    "message": f"Finance goal not found or already inactive: id={goal_id}",
                    "payload": {},
                }, 404

            result = DBHelper.update_one(
                table_name="user_finance_goals",
                filters={"id": goal_id_int, "user_id": uid},
                updates={"is_active": 0, "updated_at": datetime.now().isoformat()},
                return_fields=[
                    "id",
                    "name",
                    "saved_percentage",
                    "target_percentage",
                    "saved_amount",
                    "target_amount",
                    "goal_status",
                    "deadline",
                    "is_active",
                    "created_at",
                    "updated_at",
                ],
            )
            if result:
                logger.info(f"Finance goal deactivated successfully: id={goal_id}, is_active={result['is_active']}")
                deactivated_goal = {
                    "id": str(result["id"]),
                    "name": result["name"],
                    "saved_percentage": float(result["saved_percentage"]),
                    "target_percentage": float(result["target_percentage"]),
                    "saved_amount": float(result["saved_amount"]),
                    "target_amount": float(result["target_amount"]),
                    "goal_status": result["goal_status"],
                    "deadline": (
                        result["deadline"].strftime("%Y-%m-%d")
                        if result["deadline"]
                        else None
                    ),
                    "is_active": result["is_active"],
                    "created_at": (
                        result["created_at"].isoformat()
                        if result["created_at"]
                        else None
                    ),
                    "updated_at": (
                        result["updated_at"].isoformat()
                        if result["updated_at"]
                        else None
                    ),
                }
                return {
                    "status": 1,
                    "message": "Finance Goal Deactivated Successfully",
                    "payload": {"goal": deactivated_goal},
                }, 200
            else:
                logger.warning(f"Failed to deactivate finance goal: id={goal_id}, user_id={uid}")
                return {
                    "status": 0,
                    "message": f"Failed to deactivate finance goal: id={goal_id}",
                    "payload": {},
                }, 500
        except Exception as e:
            logger.error(f"Error deactivating finance goal: id={goal_id}, error={str(e)}")
            return {
                "status": 0,
                "message": f"Error deactivating finance goal: {str(e)}",
                "payload": {},
            }, 500
        

class GenerateMonthlyBudget(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json() or {}
            uid_from_body = data.get('uid')
            if not uid:
                uid = uid_from_body
            if not uid:
                return {"error": "Missing user_id"}, 400

            TRANSACTION_TABLE = "user_bank_transactions"

            transactions = DBHelper.find_all(
                table_name=TRANSACTION_TABLE,
                filters={"user_id": uid},
                select_fields=["transaction_id", "amount", "entry_type", "date", "description", "categoryname", "category"],
            ) or []

            logger.info(f"Fetched {len(transactions)} transactions for user {uid}")

            if not transactions:
                logger.warning(f"No transactions found for user {uid}")
                return {
                    "status": 1,
                    "message": "No transactions found",
                    "budget_categories": {
                        "Needs": {"spent": 0.0, "budget": 0.0, "transactions": [], "count": 0},
                        "Wants": {"spent": 0.0, "budget": 0.0, "transactions": [], "count": 0},
                        "Savings": {"spent": 0.0, "budget": 0.0, "transactions": [], "count": 0},
                        "Others": {"spent": 0.0, "budget": 0.0, "transactions": [], "count": 0},
                    },
                    "budget_summary": {
                        "Needs": {"spent": 0.0, "total": 0.0},
                        "Wants": {"spent": 0.0, "total": 0.0},
                        "Savings": {"spent": 0.0, "total": 0.0},
                        "Others": {"spent": 0.0, "total": 0.0},
                    },
                    "spending_by_category": [
                        {"name": "Housing", "spent": 0.0, "budget": 0.0, "type": "Needs", "icon": "Home"},
                        {"name": "Groceries", "spent": 0.0, "budget": 0.0, "type": "Needs", "icon": "ShoppingCart"},
                        {"name": "Transport", "spent": 0.0, "budget": 0.0, "type": "Needs", "icon": "Car"},
                        {"name": "Dining Out", "spent": 0.0, "budget": 0.0, "type": "Wants", "icon": "Utensils"},
                        {"name": "Shopping", "spent": 0.0, "budget": 0.0, "type": "Wants", "icon": "ShoppingBag"},
                        {"name": "Subscriptions", "spent": 0.0, "budget": 0.0, "type": "Wants", "icon": "Smartphone"},
                        {"name": "Emergency", "spent": 0.0, "budget": 0.0, "type": "Savings", "icon": "Shield"},
                        {"name": "Investments", "spent": 0.0, "budget": 0.0, "type": "Savings", "icon": "TrendingUp"},
                        {"name": "Goals", "spent": 0.0, "budget": 0.0, "type": "Savings", "icon": "Target"},
                    ],
                }

            summary = defaultdict(lambda: {"spent": 0.0, "count": 0})
            all_transactions = defaultdict(list)

            for txn in transactions:
                budget_cat = txn.get("categoryname", "Others")
                if budget_cat not in BUDGET_CATEGORIES:
                    budget_cat = "Others"

                amount = float(txn.get("amount", 0)) if isinstance(txn.get("amount"), Decimal) else float(txn.get("amount", 0))
                amount = abs(amount)

                summary[budget_cat]["spent"] += amount
                summary[budget_cat]["count"] += 1
                all_transactions[budget_cat].append(
                    {
                        "transaction_id": txn.get("transaction_id", ""),
                        "description": txn.get("description", "Unknown"),
                        "amount": amount,
                        "categoryname": budget_cat,
                        "category": txn.get("category", "Unknown"),
                        "date": (
                            txn.get("date").strftime("%Y-%m-%d")
                            if txn.get("date")
                            else "N/A"
                        ),
                    }
                )

            for cat in BUDGET_CATEGORIES:
                if cat not in summary:
                    summary[cat] = {"spent": 0.0, "count": 0}
                summary[cat]["budget"] = round(summary[cat]["spent"] * 1.2, 2)

            all_spent = sum(v["spent"] for v in summary.values())
            all_budget = sum(v["budget"] for v in summary.values())

            budget_categories = {
                cat: {
                    "spent": round(summary[cat]["spent"], 2),
                    "budget": round(summary[cat]["budget"], 2),
                    "count": summary[cat]["count"],
                    "transactions": all_transactions[cat],
                }
                for cat in BUDGET_CATEGORIES
            }

            spending_by_category = [
                {"name": "Housing", "spent": round(summary["Needs"]["spent"] * 0.4, 2), "budget": round(summary["Needs"]["budget"] * 0.4, 2), "type": "Needs", "icon": "Home"},
                {"name": "Groceries", "spent": round(summary["Needs"]["spent"] * 0.3, 2), "budget": round(summary["Needs"]["budget"] * 0.3, 2), "type": "Needs", "icon": "ShoppingCart"},
                {"name": "Transport", "spent": round(summary["Needs"]["spent"] * 0.3, 2), "budget": round(summary["Needs"]["budget"] * 0.3, 2), "type": "Needs", "icon": "Car"},
                {"name": "Dining Out", "spent": round(summary["Wants"]["spent"] * 0.3, 2), "budget": round(summary["Wants"]["budget"] * 0.3, 2), "type": "Wants", "icon": "Utensils"},
                {"name": "Shopping", "spent": round(summary["Wants"]["spent"] * 0.4, 2), "budget": round(summary["Wants"]["budget"] * 0.4, 2), "type": "Wants", "icon": "ShoppingBag"},
                {"name": "Subscriptions", "spent": round(summary["Wants"]["spent"] * 0.3, 2), "budget": round(summary["Wants"]["budget"] * 0.3, 2), "type": "Wants", "icon": "Smartphone"},
                {"name": "Emergency", "spent": round(summary["Savings"]["spent"] * 0.4, 2), "budget": round(summary["Savings"]["budget"] * 0.4, 2), "type": "Savings", "icon": "Shield"},
                {"name": "Investments", "spent": round(summary["Savings"]["spent"] * 0.3, 2), "budget": round(summary["Savings"]["budget"] * 0.3, 2), "type": "Savings", "icon": "TrendingUp"},
                {"name": "Goals", "spent": round(summary["Savings"]["spent"] * 0.3, 2), "budget": round(summary["Savings"]["budget"] * 0.3, 2), "type": "Savings", "icon": "Target"},
            ]

            return {
                "status": 1,
                "message": "Budget generated from all transactions",
                "budget_categories": budget_categories,
                "budget_summary": {
                    cat: {"spent": summary[cat]["spent"], "total": summary[cat]["budget"]}
                    for cat in BUDGET_CATEGORIES
                },
                "spending_by_category": spending_by_category,
            }
        except Exception as e:
            logger.error(f"Error generating budget for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"},500

class GetAllTransactions(Resource):
    @auth_required(isOptional=True)
    def get(self, uid=None, user=None):
        try:
            uid = request.args.get("uid") or uid
            page = int(request.args.get('page', 1))
            page_size = int(request.args.get('page_size', 10))
            type_filter = request.args.get('type_filter', 'all')

            if not uid:
                return {"error": "Missing user_id"}, 400

            filters = {"user_id": uid}
            if type_filter != 'all':
                filters["entry_type"] = type_filter.upper()

            total = DBHelper.count("user_bank_transactions", filters=filters)
            transactions = DBHelper.find_all(
                table_name="user_bank_transactions",
                filters=filters,
                select_fields=[
                    "transaction_id",
                    "date",
                    "description",
                    "amount",
                    "status",
                    "currency_code",
                    "entry_type",
                    "account",
                    "category",
                    "merchantname",
                    "isrecurring",
                ],
                # limit=page_size,
                # offset=(page - 1) * page_size,
                order_by="date DESC"
            ) or []

            for txn in transactions:
                if isinstance(txn.get("date"), (datetime, date)):
                    txn["date"] = txn["date"].isoformat()
                if isinstance(txn.get("amount"), Decimal):
                    txn["amount"] = float(txn["amount"])

            logger.info(f"Fetched {len(transactions)} transactions for user {uid}, page {page}")
            return {
                "status": 1,
                "message": "Transactions retrieved successfully",
                "transactions": transactions,
                "total": total,
                "page": page,
                "page_size": page_size
            }
        except Exception as e:
            logger.error(f"Error fetching transactions for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"},500


class UpdateMonthlyBudget(Resource):
    @auth_required(isOptional=True)
    def post(self, uid=None, user=None):
        try:
            data = request.get_json()
            uid = data.get('uid')
            if not uid:
                return {"error": "Missing user_id"}, 400

            TRANSACTION_TABLE = "user_bank_transactions"
            BUDGET_TABLE = "user_monthly_budgets"

            budget_categories = data.get('budget_categories', {})
            current_month = datetime.now().strftime("%Y-%m")

            for cat, details in budget_categories.items():
                budget = safe_load(details.get('budget', 0.0))
                existing = DBHelper.find_one(
                    table_name=BUDGET_TABLE,
                    filters={"user_id": uid, "month": current_month, "categoryname": cat},
                    select_fields=["id"]
                )
                if existing:
                    DBHelper.update_one(
                        table_name=BUDGET_TABLE,
                        filters={"user_id": uid, "month": current_month, "categoryname": cat},
                        updates={"budget": budget, "updated_at": datetime.now()}
                    )
                else:
                    DBHelper.insert(
                        table_name=BUDGET_TABLE,
                        user_id=uid,
                        month=current_month,
                        categoryname=cat,
                        budget=budget,
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )

            logger.info(f"Budget updated successfully for user {uid}")
            return {"status": 1, "message": "Budget updated successfully"}
        except Exception as e:
            logger.error(f"Error updating monthly budget for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"}, 500

class UpdateTransactionCategory(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json()
            transaction_id = data.get('transaction_id')
            categoryname = data.get('category')

            TRANSACTION_TABLE = "user_bank_transactions"

            if not transaction_id or not categoryname:
                return {"error": "Missing transaction_id or category"}, 400, {'Access-Control-Allow-Origin': '*'}

            updated = DBHelper.update_one(
                table_name=TRANSACTION_TABLE,
                filters={"user_id": uid, "transaction_id": transaction_id},
                updates={"categoryname": categoryname, "updated_at": datetime.now()}
            )

            if updated:
                logger.info(f"Transaction {transaction_id} category updated to {categoryname} for user {uid}")
                return {"status": 1, "message": "Transaction category updated successfully"}, 200, {'Access-Control-Allow-Origin': '*'}
            else:
                return {"error": "Transaction not found or no update needed"}, 404, {'Access-Control-Allow-Origin': '*'}
        except Exception as e:
            logger.error(f"Error updating transaction category for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"}, 500, {'Access-Control-Allow-Origin': '*'}

class GetSavingsGoalsWithProgress(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            goals = DBHelper.find_all(
                "finance_goals",
                {"user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "name",
                    "target_amount",
                    "saved_amount",
                ],
            )

            savings_goals = []
            for goal in goals:
                target = float(goal["target_amount"]) if goal["target_amount"] else 0
                saved = float(goal["saved_amount"]) if goal["saved_amount"] else 0
                progress = (saved / target * 100) if target > 0 else 0
                savings_goals.append(
                    {
                        "id": goal["id"],
                        "name": goal["name"],
                        "target_amount": saved,
                        "saved_amount": target,
                        "progress": round(progress, 2),
                    }
                )

            return {
                "status": 1,
                "message": "Savings goals retrieved successfully",
                "payload": savings_goals,
            }
        except Exception as e:
            logger.error(f"Error retrieving savings goals for user {uid}: {str(e)}")
            return {"error": f"Internal server error: {str(e)}"}, 500


