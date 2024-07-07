# preface33

Install [Node.js](https://nodejs.org/en/download) first.

Then clone this repo.

If you use [VS Code](https://code.visualstudio.com/), I suggest grabbing these extensions to make your life easier:
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
- [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (this is optional since React/Vite already has a feature similar to this)

After cloning, run `npm install` on your terminal to install the dependencies. Also do same in the functions directory.

Then run `npm run dev` to start the app.

To deploy cloud functions run `firebase deploy --only functions`.

EmailJS setup

- Create an account in EmailJS and get the Public Api Key.
- Create an email service and get the Service ID.
- Create an email template and get the Template ID.
- Then replace or create environment variables in the sendPasswordEmail function found in Register1.jsx and Register2.jsx
