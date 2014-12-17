# Authentication

### Uses
- Whole page/responder auth required
  - all site
  - select pages
  - categories of pages
- Different content of page depending on auth
  - index lists only public pages to non-authed peeps
- POST/API requests
  - edit posts in-browser
  - create post

### openid/oauth
I don't want to validate, store, and handle credentials. For now just use google oauth, but possibly open this up to other login services (yahoo, hotmail, &hellip;) later.

### YAGNI!!
I simplified authentication dramatically by employing the YAGNI principle. This simple implementation may work for years.

Public documents are viewable by everyone.
Private documents are viewable by only authenticated users in the users table.

App can determine whether user is authenticated to change content for private/public viewers.

### Prospects
I may want to make it so that users have different priviledge levels. Some day I may want to handle comments or other interactions with a page, and I may want to make pages visible to only certain users.
