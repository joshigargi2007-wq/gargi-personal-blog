# Gargi Joshi's Personal Blog

A personal blog built with HTML, CSS and JavaScript. It runs in a browser and does not need a build tool or extra software.

## Project files

- `index.html` contains the page structure.
- `style.css` controls the layout, colours and other styling.
- `app.js` handles the blog features and page interactions.
- `posts.js` contains the site details and blog posts.
- `README.md` explains how to edit and publish the site.

## Editing the blog

Most content changes can be made in `posts.js`.

- Update the `SITE` settings to change the name, introduction and other site details.
- Add a new entry to the `POSTS` list when you write another post. Use an existing post as a guide and give each post its own `slug`.
- Posts can include headings, paragraphs, lists, links, images, code blocks and quizzes.

Use the same format as the existing posts when making changes. Keep the JavaScript syntax intact, including commas and quotation marks.

To change the appearance, edit `style.css`. Changes to the layout or interactive features may also require edits to `app.js`.

## Viewing the site

Open `index.html` in a web browser to preview the blog. You can also use a local development server if your browser restricts any features when opening files directly.

## Publishing with GitHub Pages

1. Create a repository on GitHub.
2. Upload the contents of this folder to the repository's main branch. Make sure `index.html` is in the repository's top-level folder.
3. Open the repository's **Settings** and select **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/(root)` folder, then save.
6. After GitHub finishes publishing, the site address will appear in the Pages section.

When you update the blog, upload the changed files and commit them to the same branch. GitHub Pages will publish the updated version.

## Guestbook

Guestbook entries are saved in the visitor's browser using local storage. They are not sent to a server, and visitors using different browsers or devices will not see one another's entries. Clearing the browser's site data can remove saved entries.

## Before publishing

Check the site in a browser after making changes. Test the navigation, post links, quizzes, theme toggle and guestbook. Do not upload passwords, private information or files that should not be public.
