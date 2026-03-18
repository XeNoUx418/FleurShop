# Create the database tables
python manage.py makemigrations
python manage.py migrate

# Create an admin account for yourself
python manage.py createsuperuser


Username: babaahmed_elhocine
Email address: elhocine.baba.ahmed@gmail.com
Password: elhocine2004


# Run the server
python manage.py runserver 8001
```

> We use port **8001** (not the default 8000) because later the API Service will use 8002, etc.

---

## Step 14 — Test with Postman

Your endpoints are now live at `http://localhost:8001`:

| Action | Method | URL | Body |
|---|---|---|---|
| Register | POST | `/auth/register/` | `{"username":"alice", "password":"pass123", "role":"customer"}` |
| Login | POST | `/auth/login/` | `{"username":"alice", "password":"pass123"}` |
| Get my info | GET | `/auth/me/` | Header: `Authorization: Bearer <token>` |
| Admin panel | — | `/admin/` | your superuser credentials |

---

## ✅ Your Auth Service is Done!

Your current file structure should be:
```
fleurshop/
└── auth-service/
    ├── auth_service/
    │   ├── settings.py  ✓ configured
    │   └── urls.py      ✓ configured
    ├── users/
    │   ├── models.py      ✓ CustomUser
    │   ├── serializers.py ✓ Register + User
    │   ├── views.py       ✓ Register + Me
    │   ├── urls.py        ✓ 4 endpoints
    │   └── admin.py       ✓ registered
    ├── manage.py
    └── requirements.txt