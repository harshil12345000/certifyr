# Vercel Deployment and Integration Instructions

This document outlines the steps to deploy your static website to Vercel and integrate it with an existing dashboard or web application. Vercel is a popular platform for deploying frontend applications, offering ease of use and excellent performance for static sites.

## Section 1: Deploying Your Site to Vercel

Deploying your website to Vercel is a straightforward process, especially for static sites like yours. You can deploy directly from your local machine using the Vercel CLI or by connecting a Git repository (e.g., GitHub, GitLab, Bitbucket).

### Method 1: Deploying with Vercel CLI (Command Line Interface)

This method is suitable if you want to quickly deploy from your local machine without setting up a Git repository.

1.  **Install Vercel CLI**: If you haven't already, install the Vercel CLI globally on your machine. You'll need Node.js installed to do this.

    ```bash
    npm install -g vercel
    ```

2.  **Log In to Vercel**: Open your terminal or command prompt, navigate to your project directory (where your `index.html` and other files are located), and log in to your Vercel account.

    ```bash
    vercel login
    ```

    This command will prompt you to log in via your web browser. Follow the instructions to complete the login process.

3.  **Deploy Your Project**: Once logged in, you can deploy your project by running the `vercel` command in your project directory.

    ```bash
    vercel
    ```

    The CLI will guide you through the deployment process:
    *   It will ask if you want to deploy to an existing project or a new one. Choose 


the appropriate option.
    *   It will detect that your project is a static site and suggest a build command (which might be empty for pure static HTML) and an output directory (usually `.`). Confirm these or adjust if necessary.
    *   Vercel will then deploy your project and provide you with a unique URL for your deployment.

### Method 2: Deploying with Git (Recommended for Continuous Deployment)

This is the preferred method for most web projects as it enables continuous deployment: every time you push changes to your Git repository, Vercel automatically builds and deploys your site.

1.  **Initialize a Git Repository**: If your project is not already under Git version control, navigate to your project directory in the terminal and initialize a new Git repository.

    ```bash
    git init
    ```

2.  **Add Files and Commit**: Add your website files to the repository and make your initial commit.

    ```bash
    git add .
    git commit -m "Initial commit of Certifyr website"
    ```

3.  **Create a Remote Repository**: Create a new empty repository on a Git hosting service like GitHub, GitLab, or Bitbucket. Do NOT initialize it with a README or license file.

4.  **Link Local to Remote Repository**: Link your local Git repository to the newly created remote repository.

    ```bash
    git remote add origin <YOUR_REMOTE_REPOSITORY_URL>
    git branch -M main
    git push -u origin main
    ```

    Replace `<YOUR_REMOTE_REPOSITORY_URL>` with the actual URL of your remote repository.

5.  **Import Project to Vercel**: Go to the Vercel dashboard (vercel.com) and click on 



"New Project".

    *   Select "Import Git Repository" and choose the Git provider where you hosted your project (e.g., GitHub).
    *   Authorize Vercel to access your repositories if prompted.
    *   Select the repository containing your website files.
    *   Vercel will automatically detect that it's a static HTML project. Confirm the project name and other settings. You can leave the "Build and Output Settings" as default unless you have a specific build process.
    *   Click "Deploy". Vercel will then build and deploy your site, providing you with a live URL.

## Section 2: Connecting Your Site with Your Current Dashboard/Webapp

Connecting your newly deployed static website with an existing dashboard or web application typically involves one of two main approaches: **subdomain integration** or **iframe embedding**. The best approach depends on the architecture of your existing dashboard/webapp and your desired user experience.

### Method 1: Subdomain Integration (Recommended)

This is the cleanest and most robust method. It involves hosting your static site on a subdomain (e.g., `docs.yourdomain.com` or `waitlist.yourdomain.com`) and linking to it from your main dashboard/webapp. This keeps your static site separate from your main application, improving performance and maintainability.

1.  **Add a Custom Domain in Vercel**: In your Vercel project dashboard, go to the "Settings" tab, then "Domains". Add your desired subdomain (e.g., `waitlist.yourdomain.com`). Vercel will provide you with DNS records (usually `A` or `CNAME` records) that you need to add to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare).

2.  **Configure DNS Records**: Go to your domain registrar or DNS provider and add the DNS records provided by Vercel. This step points your subdomain to your Vercel deployment. It might take some time for DNS changes to propagate globally.

3.  **Link from Your Dashboard/Webapp**: Once your subdomain is live, you can simply add a link (an `<a>` tag) in your existing dashboard/webapp that points to your new static site.

    ```html
    <a href="https://waitlist.yourdomain.com">Join Our Waitlist</a>
    ```

    This approach is SEO-friendly, provides a consistent user experience, and keeps your static content separate from your dynamic application.

### Method 2: Iframe Embedding (Use with Caution)

Iframe embedding involves embedding your static website directly into a page within your existing dashboard/webapp using an `<iframe>` tag. While seemingly simple, this method has several drawbacks and should be used only if subdomain integration is not feasible.

1.  **Embed the Iframe**: In the HTML of your dashboard/webapp, add an `<iframe>` tag pointing to your Vercel-deployed site:

    ```html
    <iframe src="https://your-vercel-deployment-url.vercel.app" width="100%" height="600px" frameborder="0"></iframe>
    ```

    Replace `https://your-vercel-deployment-url.vercel.app` with the actual URL of your Vercel deployment (or your custom domain if you set one up).

2.  **Considerations and Drawbacks of Iframes**:
    *   **Security**: Iframes can pose security risks if the embedded content is not trusted. Ensure your Vercel site is secure.
    *   **Responsiveness**: Making iframes responsive across different devices can be challenging.
    *   **SEO**: Content within iframes is generally not well-indexed by search engines.
    *   **User Experience**: Users might find it disorienting to interact with an embedded site, and issues like scrolling within an iframe can be frustrating.
    *   **Cross-Origin Issues**: If your main dashboard and the embedded site are on different domains, you might encounter cross-origin security restrictions, preventing scripts from interacting between the two.

### Connecting to a Backend/API (If Applicable)

Your current website is purely static. If your dashboard/webapp has a backend or API that your static site needs to interact with (e.g., for the waitlist form), you will need to configure your static site to make API calls to your backend. This typically involves:

*   **JavaScript Fetch/Axios**: Writing JavaScript code in your static site to send data to your backend API endpoints.
*   **CORS (Cross-Origin Resource Sharing)**: Your backend API must be configured to allow requests from your static site's domain (or subdomain) to prevent cross-origin errors. This is a crucial security measure that prevents unauthorized domains from accessing your API.

    Example (Node.js/Express backend): 
    ```javascript
    const express = require("express");
    const cors = require("cors");
    const app = express();

    app.use(cors({
      origin: "https://waitlist.yourdomain.com" // Or your Vercel deployment URL
    }));

    // Your API routes
    app.post("/api/waitlist", (req, res) => {
      // Handle waitlist submission
      res.send("Success!");
    });

    app.listen(3000, () => console.log("Backend running on port 3000"));
    ```

    This `cors` configuration tells the browser that requests from `https://waitlist.yourdomain.com` are allowed to access your API.

By following these steps, you can effectively deploy your static website on Vercel and integrate it seamlessly with your existing digital infrastructure.

