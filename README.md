# Budget React

Port of the original `budget.html` into a React + Vite app.

Quick start:

1. npm install
2. npm run dev

Notes:
- Uses TailwindCSS and Chart.js via react-chartjs-2.
- Dark mode is class-based and toggled with the button in the header.
- Sunflower icon used for row lock controls.
- This initial implementation mimics shadcn-ui styles using Tailwind; if you want official shadcn components, I can wire them up next.

Deployment
----------

Three simple options to deploy this Vite app:

1) Vercel (recommended)
	- Create a Vercel project and point it at this repository.
	- Build command: `npm run build`
	- Output directory: `dist`

2) Netlify
	- Create a site from Git, set build command to `npm run build` and publish directory to `dist`.

3) GitHub Pages (automated)
	- This repo includes a GitHub Actions workflow (.github/workflows/deploy-pages.yml) that builds on push to `main` and deploys `dist` to Pages.
	- Ensure the branch is `main` and GitHub Pages is enabled for the repo.

Notes:
 - Place your `sunflower-ghibli.jpg` in the `public` folder so the local background image is used.
 - If you want server-side AI evaluation, you'll need to add an API key and a small server; I can add an example if desired.
 - If you deploy to GitHub Pages under a project path (e.g., `https://username.github.io/repo-name`), set `base` in `vite.config.js`:

		```js
		// vite.config.js
		import { defineConfig } from 'vite'
		import react from '@vitejs/plugin-react'

		export default defineConfig({
			base: '/repo-name/',
			plugins: [react()]
		})
		```

	Authentication
	--------------

	This project includes a simple client-side authentication demo (register/login) that stores credentials in localStorage. This is strictly for demo/local use only and is NOT secure for production.

	For production, use a real authentication provider (Auth0, Firebase Auth, Clerk, or your own server-side auth) and secure storage for user data.

	Clerk integration
	-----------------

	This branch can be configured to use Clerk for authentication. Steps:

	1. Create a Clerk account and a new application at https://clerk.com.
	2. Get your Publishable Key from the Clerk dashboard.
	3. Create a `.env` file in the project root with:

		VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

	4. Install dependencies and run the app. Clerk's hosted SignIn/SignUp UI will be available at `/sign-in` and `/sign-up`.

	Security: Clerk manages auth securely; do not commit your publishable key to public repos.


