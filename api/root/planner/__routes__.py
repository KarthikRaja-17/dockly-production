# Route registrations
from .models import (
    AddHabit,
    AddSmartNote,
    AddWeeklyGoals,
    AddWeeklyTodos,
    DeleteWeeklyGoal,
    DeleteWeeklyTodo,
    GetHabits,
    GetSmartNotes,
    ShareGoal,
    ShareTodo,
    UpdateHabitProgress,
    UpdateWeeklyGoals,
    UpdateWeeklyTodos,
    GetCalendarEvents,
    GetPlannerDataComprehensive, 
    EditHabit,
    DeleteHabit, # New comprehensive endpoint
)
from . import planner_api

# New comprehensive endpoint for optimal loading
planner_api.add_resource(GetPlannerDataComprehensive, "/get/planner-data-comprehensive")

planner_api.add_resource(AddWeeklyGoals, "/add/weekly-goals")
planner_api.add_resource(UpdateWeeklyGoals, "/update/weekly-goals")
# planner_api.add_resource(GetWeeklyGoals, "/get/weekly-goals")

planner_api.add_resource(GetCalendarEvents, "/get/calendar/events")

planner_api.add_resource(AddWeeklyTodos, "/add/weekly-todos")
planner_api.add_resource(UpdateWeeklyTodos, "/update/weekly-todos")
# planner_api.add_resource(GetWeeklyTodos, "/get/weekly-todos")

# planner_api.add_resource(AddWeeklyFocus, "/add/weekly-focus")
# planner_api.add_resource(GetWeeklyFocus, "/get/weekly-focus")

planner_api.add_resource(AddSmartNote, "/add/smart-notes")
planner_api.add_resource(GetSmartNotes, "/get/smart-notes")
# planner_api.add_resource(FrequentNotes, "/smartnotes/suggestions/<string:uid>")


planner_api.add_resource(DeleteWeeklyGoal, "/delete/weekly-goals")
planner_api.add_resource(ShareGoal, "/share/goals")
planner_api.add_resource(DeleteWeeklyTodo, "/delete/weekly-todos")
planner_api.add_resource(ShareTodo, "/share/todo")

planner_api.add_resource(AddHabit, "/add/habit")
planner_api.add_resource(GetHabits, "/get/habits")
planner_api.add_resource(UpdateHabitProgress, "/update/habit")
planner_api.add_resource(EditHabit, "/edit/habit")
planner_api.add_resource(DeleteHabit, "/delete/habit")