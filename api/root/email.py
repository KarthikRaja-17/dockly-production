# from flask import escape

from root.common import Hubs

# from your_module import Hubs  # Make sure this contains your full Hubs config


def generate_invitation_email(form_data, username=None, invite_link="#"):
    name = form_data.get("name", "User")
    relationship = (
        form_data.get("relationship", "")
        .replace("❤", "")
        .replace("👶", "")
        .replace("👴", "")
    )
    access_level = form_data.get("permissions", {}).get("type", "Viewer")
    shared_items = form_data.get("sharedItems", {})
    sender = username if username else "Family Hub Team"

    # ✅ Format shared items as HTML list grouped by hub
    shared_items_html = ""
    for hub_key, item_names in shared_items.items():
        hub = next((h for h in Hubs if h["label"]["name"] == hub_key), None)
        if not hub or not item_names:
            continue
        hub_title = hub["label"]["title"]
        shared_items_html += f"<p style='margin-bottom: 4px; font-weight: 600;'>{hub_title}:</p><ul style='margin-top: 4px; padding-left: 20px;'>"
        for item_name in item_names:
            child = next((c for c in hub["children"] if c["name"] == item_name), None)
            item_title = child["title"] if child else item_name
            shared_items_html += f"<li style='margin-bottom: 6px;'>{item_title}</li>"
        shared_items_html += "</ul>"

    html_body = f"""
    <html>
    <head>
        <style>
            body {{
                margin: 0;
                padding: 0;
                background-color: #f0f2f5;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }}
            .email-wrapper {{
                max-width: 1100px;
                margin: 30px auto;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                overflow: hidden;
                color: #333;
            }}
            .header {{
                background: linear-gradient(135deg, #6e8efb, #a777e3);
                padding: 30px;
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 26px;
            }}
            .content {{
                padding: 30px;
            }}
            .content p {{
                font-size: 16px;
                line-height: 1.6;
            }}
            .info-block {{
                margin: 25px 0;
                background-color: #f7f9fc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #6e8efb;
            }}
            .info-block span {{
                display: block;
                font-size: 15px;
                margin: 8px 0;
            }}
            .button {{
                display: inline-block;
                margin: 30px auto 10px auto;
                background-color: #6e8efb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
            }}
            .footer {{
                background: #f0f2f5;
                text-align: center;
                padding: 20px;
                font-size: 13px;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1>🎉 You're Invited to Join in {sender}'s Family Hub!</h1>
            </div>
            <div class="content">
                <p>Hi <strong>{name}</strong>,</p>
                <p>You've been invited to join our <strong>Family Hub</strong>. Here's a quick summary of your access:</p>
                <div class="info-block">
                    <span>👨‍👩‍👧‍👦 <strong>Relationship:</strong> {relationship}</span>
                    <span>🔐 <strong>Access Level:</strong> {access_level}</span>
                    <span>📂 <strong>Shared Items:</strong><br/>{shared_items_html or 'None'}</span>
                </div>
                <p>Click the button below to accept the invitation and get started:</p>
                <div style="text-align: center;">
                    <a class="button" href="{invite_link}">Accept Invitation</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href="{invite_link}">{invite_link}</a></p>
                <p>Welcome aboard!</p>
                <p>Best regards,<br><strong>{sender}</strong></p>
            </div>
            <div class="footer">
                © Dockly {sender} | Secure & Private Access for Families
            </div>
        </div>
    </body>
    </html>
    """
    return html_body
