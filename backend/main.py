from app import app

from firebase_functions import https_fn, options
from firebase_admin import initialize_app

initialize_app()

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def api(req):
    with app.request_context(req.environ):
        return app.full_dispatch_request()