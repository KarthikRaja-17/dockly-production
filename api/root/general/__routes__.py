from root.general.bank import *
from root.general.currentUser import CurrentUser
from . import general_api

general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")
general_api.add_resource(BankConnect, "/connect/bank")
general_api.add_resource(GetBankAccount, "/get/bank-account")
general_api.add_resource(SaveBankAccount, "/save/bank-account")
general_api.add_resource(SaveBankTransactions, "/save/bank-transactions")
general_api.add_resource(GetAllTransactions, "/get/saved-transactions")
general_api.add_resource(RecurringTransactions, "/get/recurring-transactions")

general_api.add_resource(AddAccounts, "/add/accounts")
general_api.add_resource(GetAccounts, "/get/accounts")
general_api.add_resource(GetIncomeExpense, "/get/income-expense")
general_api.add_resource(GetTotalBalance, "/get/total-balance")


general_api.add_resource(UpdateMonthlyBudget, "/update/monthly-budget")
general_api.add_resource(GenerateMonthlyBudget, "/get/monthly-budget")
general_api.add_resource(UpdateTransactionCategory, "/update/transaction-category")
general_api.add_resource(UpdateRecurringStatus, "/update/recurring-status")



# New routes for finance goals
general_api.add_resource(AddFinanceGoal, "/add/finance-goal")
general_api.add_resource(GetFinanceGoals, "/get/finance-goal")
general_api.add_resource(UpdateFinanceGoal, "/update/finance-goal/<string:goal_id>")
general_api.add_resource(DeleteFinanceGoal, "/delete/finance-goal/<string:goal_id>")