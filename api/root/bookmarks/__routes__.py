from .models import GetBookmarks, SaveAllBookmarks, SaveBookmarks
from . import bookmarks_api


bookmarks_api.add_resource(SaveBookmarks, "/save")
bookmarks_api.add_resource(SaveAllBookmarks, "/all/save")
bookmarks_api.add_resource(GetBookmarks, "/get")


# ---------------------------------------NEWW----------------------------------------


from .models import *
from . import bookmarks_api

bookmarks_api.add_resource(AddOrUpdateBookmark, "/add/bookmark")
bookmarks_api.add_resource(GetBookmark, "/get/bookmarks")
bookmarks_api.add_resource(DeleteBookmark, "/delete/bookmark")
bookmarks_api.add_resource(ToggleFavorite, "/toggle/bookmark")
bookmarks_api.add_resource(GetBookmarkCategories, "/categories")
bookmarks_api.add_resource(GetBookmarkStats, "/stats")
bookmarks_api.add_resource(ShareBookmark, "/share/bookmarks")
