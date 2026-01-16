<!-- Acceptance foor everyone  -->

/ → Landing page
/login → Login page
/register → Customer registration
/company/register → Owner registration
/about → About
/contact → Contact

<!-- Customer routes (Parking User) -->

/customer/dashboard
/customer/search
/customer/garages/[garageId]
/customer/bookings
/customer/bookings/[bookingId]
/customer/reviews
/customer/profile

role = customer
status = active

<!--  Company owner routes  -->

/company/dashboard
/company/status
/company/garages
/company/garages/create
/company/garages/[garageId]
/company/managers
/company/analytics
/company/settings

if company status pending

/company/status
/company/settings

<!-- garage manager routes -->

/garage/dashboard
/garage/bookings
/garage/bookings/[bookingId]
/garage/slots
/garage/valets
/garage/analytics
/garage/settings

role = manager , assigned , status = active

<!-- valet routes -->

/valet/dashboard
/valet/garage
/valet/checkin
/valet/checkout
/valet/profile

<!-- admin routes -->

/admin/dashboard
/admin/companies
/admin/companies/[companyId]
/admin/garages
/admin/garages/[garageId]
/admin/users
/admin/analytics
/admin/settings

<!-- shared routes -->

/profile
/settings

<!-- default page login redirect  -->

admin → /admin/dashboard
owner → /company/dashboard
manager → /garage/dashboard
valet → /valet/dashboard
customer → /dashboard
