# Herbora: Plant Wisdom

FINAL WEBSITE GENERATION PROMPT

You are a senior full-stack developer, UI/UX designer, and product architect. Build a complete, functional, responsive website for my college CEP project, Herbora, an Ayurveda-focused digital platform for discovering, learning about, and identifying medicinal plants.

I have attached two important visual references:

Herbora homepage reference image: Use this as the primary design reference. Recreate its layout, visual hierarchy, spacing, typography, colors, cards, navigation, and overall appearance as faithfully as possible.

Herbora logo: Use the attached logo as the official brand identity. Do not redesign, replace, or alter it.

The homepage must closely reproduce the attached reference image. Do not replace its design with a generic AI-generated website template.

1. PROJECT OVERVIEW

Business Name

Herbora

Industry

Ayurveda, medicinal plants, botanical education, herbal wellness, and plant image processing.

Main Problem

Information about Ayurvedic plants is scattered across different sources. Beginners, students, and plant enthusiasts often struggle to discover organized plant information, understand traditional Ayurvedic knowledge, and identify unfamiliar plants.

Solution

Herbora is a centralized platform that allows users to:

 Explore Ayurvedic plants.

 Learn about their traditional significance.

 Discover herbal wellness information.

 Identify plants through images.

 Save interesting plants in a personal collection.

 Access future Ayurveda-related tools from one platform.

Target Users

 Students.

 Ayurveda enthusiasts.

 Beginners interested in medicinal plants.

 Plant lovers and gardeners.

 Researchers and educators.

 People interested in traditional herbal knowledge.

Initial Features

The initial website should include:

Plantopedia — Herbora's plant information database.

My Plant DB — A personal collection of saved plants.

AI-assisted Plant Identification — Image upload and plant image-processing functionality.

 A visually polished homepage.

 User authentication.

 A scalable structure for additional features that I will provide later.

Do not add unrelated features or invent additional complex functionality.

2. MANDATORY TECH STACK

Keep the technology stack simple and understandable for a college development team.

Frontend

 HTML5.

 CSS3.

 JavaScript.

 React.js.

 React Router for navigation, if required.

Use React components with regular CSS or simple CSS modules. Tailwind CSS may be used only if it does not complicate the project or reduce fidelity to the reference design.

Do not introduce unnecessary frontend frameworks.

Backend

 Python.

 Flask.

 Flask REST API.

Database

 Supabase PostgreSQL.

 SQLAlchemy for database operations through Flask.

Authentication

 Supabase Authentication.

 Email and password login.

 Google authentication if configured.

 Secure session handling.

Image Processing

 Flask backend for processing requests.

 Cloudinary for image storage if required.

 A configurable plant-identification API or model.

The AI identification service must be replaceable so that a specialized Ayurvedic plant-identification model can be integrated later.

Frontend–Backend Communication

Use the standard JavaScript fetch() API to communicate with Flask.

Do not add Redux, Next.js, Docker, Kubernetes, microservices, or other unnecessary technologies.

3. BRANDING AND DESIGN DIRECTION

The attached homepage image is the primary visual source of truth.

The attached logo is the official Herbora logo.

Overall Design

The website must feel:

 Natural.

 Elegant.

 Calm.

 Premium.

 Educational.

 Ayurvedic.

 Modern.

 Trustworthy.

 Connected to botanical knowledge.

The design should look like a polished real-world product, not a basic college project.

Color Palette

Use colors inspired by the reference image:

 Warm ivory / soft cream background.

 Deep forest green.

 Muted sage green.

 Soft olive green.

 Warm beige.

 Light botanical green.

 Subtle earthy gold accents.

Use the following approximate colors as a starting point:

Background:       #F8F5EA
Deep Green:       #174B2B
Forest Green:     #285D36
Sage Green:       #8DA56B
Light Sage:       #DDE5C9
Warm Beige:       #EDE6D5
Border:           #D9D6C9

Adjust these colors where necessary to match the attached reference image.

Typography

Use an elegant serif font for prominent headings and the Herbora wordmark where appropriate.

Use a clean, readable sans-serif font for:

 Navigation.

 Search.

 Buttons.

 Body text.

 Forms.

 Plant information.

The typography should closely resemble the reference image.

Visual Elements

Use:

 Botanical illustrations.

 Realistic herbal imagery.

 Soft cream surfaces.

 Thin subtle borders.

 Rounded rectangular cards.

 Gentle shadows.

 Muted green icons.

 Natural decorative leaf elements.

Avoid:

 Neon colors.

 Excessive gradients.

 Dark dashboard-style layouts.

 Excessive glassmorphism.

 Unnecessary animations.

 Generic SaaS templates.

 Overly colorful designs.

 Excessive rounded pill-shaped elements.

 Unrelated stock imagery.

4. OFFICIAL HERBORA LOGO

Use the attached Herbora logo throughout the website.

The logo contains:

 A green botanical Ayurvedic emblem.

 A mortar-and-pestle-inspired design.

 Botanical leaves.

 The “Herbora” wordmark.

 A natural green color scheme.

 The tagline:

ANCIENT WISDOM • MODERN DISCOVERY

Logo Rules

 Use the attached logo as provided.

 Preserve its proportions.

 Do not distort it.

 Do not change its colors.

 Do not recreate it using a different icon.

 Do not add unnecessary effects.

 Use a suitable transparent or cream-background version where available.

 Ensure the logo remains readable on desktop and mobile.

 Use the logo in the header, footer, and appropriate brand areas.

If the logo image contains a cream background, ensure that it visually blends with the website's cream theme.

5. HOMEPAGE — RECREATE THE ATTACHED REFERENCE EXACTLY

The attached homepage screenshot is the most important design reference.

Recreate the homepage as faithfully as possible, including its:

 Overall layout.

 Navigation structure.

 Search bar.

 Hero composition.

 Text.

 Plant imagery.

 Card arrangement.

 Colors.

 Typography.

 Spacing.

 Borders.

 Button styling.

 Decorative botanical elements.

 Floating assistant icon.

Do not redesign the homepage into a different layout.

5.1 Top Brand Header

At the top of the page, create a centered brand header.

Include:

 The Herbora logo or official wordmark.

 A warm cream background.

 Generous vertical spacing.

 A clean, centered composition.

The brand should feel elegant and prominent.

5.2 Main Navigation Bar

Below the brand header, create a wide navigation bar matching the reference image.

The navigation should include:

Left side

A hamburger menu icon.

The hamburger menu should open a responsive navigation drawer or menu containing:

 Home.

 Plantopedia.

 My Plant DB.

 Identify a Plant.

 About.

Center

A large search bar with:

 Search icon.

 Placeholder text exactly as shown in the reference:

Search herbs, remedies, wellness...

The search bar should have:

 A cream or white background.

 Thin subtle border.

 Rounded corners.

 Comfortable padding.

 Readable text.

 Responsive width.

The search should eventually support searching Herbora content. For now, it may navigate to Plantopedia or display a suitable search state.

Right side

Include:

 A camera icon button.

 A user profile icon button.

The camera button should navigate to Identify a Plant.

The profile button should navigate to the login page or account page depending on authentication status.

5.3 Hero Section

Recreate the hero section from the attached image.

The hero should use a wide, warm cream background with botanical imagery.

Left side

Display the large decorative quotation mark in muted sage green.

Use the exact hero text from the reference image:

Herbora – because
every herb has a purpose
and every learner has a
journey.

Preserve the line breaks and overall visual arrangement as closely as possible.

Use an elegant dark green serif font.

Include the decorative design beneath the text:

 Thin horizontal green line on the left.

 Small leaf emblem in the center.

 Thin horizontal green line on the right.

Right side

Display a large, high-quality botanical Ayurvedic composition matching the reference image.

The composition should include:

 Green medicinal plants.

 Herbal leaves.

 A traditional mortar and pestle.

 A small wooden bowl containing dried herbs.

 Soft natural lighting.

 A warm cream background.

 A subtle botanical still-life aesthetic.

Use the attached homepage image as the visual reference.

Do not substitute the composition with unrelated flowers, generic plants, or a modern medical laboratory image.

Hero Layout

On desktop:

 Text should occupy the left side.

 Botanical composition should occupy the right side.

 Maintain the same visual balance as the reference.

 Keep the hero spacious and elegant.

On mobile:

 Stack the text and botanical image vertically.

 Preserve the same typography and visual identity.

 Ensure the hero does not overflow horizontally.

 Keep the text readable.

6. HOMEPAGE FEATURE CARDS

Immediately below the hero section, create the same three feature cards shown in the attached reference image.

The cards must appear in a three-column layout on desktop and stack vertically on mobile.

Use the same cream-colored card style, subtle borders, botanical decorations, and rounded corners.

Card 1 — Herbal Wellness

Heading

Herbal Wellness

Description

Explore the power of
natural herbs for a
healthier you.

Button

Explore Herbs →

Icon

Use a botanical herbal wellness icon similar to the reference.

Image

Include a botanical composition featuring:

 Herbal leaves.

 A traditional mortar and pestle.

 Natural green tones.

Functionality

The button should navigate to Plantopedia or the relevant herbal information section.

Card 2 — Daily Wellness

Heading

Daily Wellness

Description

Simple daily habits
for a balanced and
healthy lifestyle.

Button

Read More →

Icon

Use a calendar or daily wellness icon similar to the reference.

Image

Include a botanical tea composition featuring:

 A glass cup of herbal tea.

 Natural green tea tones.

 Botanical leaves.

 A warm wooden or natural surface.

Functionality

For the initial version, the button may navigate to a dedicated Daily Wellness page or a clearly marked coming-soon section.

Do not invent medical claims.

Card 3 — Herbal Wellness Tips

Heading

Herbal Wellness Tips

Description

Practical tips and natural
remedies to support your
wellness journey.

Button

Explore Tips →

Icon

Use a lightbulb or herbal knowledge icon similar to the reference.

Image

Include a botanical composition featuring:

 A small herbal oil bottle.

 Green leaves.

 Natural plant elements.

 Soft cream background.

Functionality

For the initial version, the button may navigate to a dedicated Herbal Wellness Tips page or a clearly marked coming-soon section.

7. HOMEPAGE VISUAL DETAILS

Reproduce the following details from the reference image:

 Warm cream page background.

 Botanical leaves entering from the edges of the hero section.

 Soft green watercolor-like botanical accents.

 Large cream-colored feature cards.

 Thin light borders.

 Subtle shadows.

 Muted green headings.

 Natural botanical illustrations.

 Rounded card corners.

 Elegant serif typography.

 Green CTA buttons.

 Small decorative leaf elements.

 Balanced whitespace.

 Floating assistant icon in the bottom-right corner.

The feature cards should feel like part of the hero composition rather than unrelated sections.

Maintain the same overall visual rhythm as the reference.

8. FLOATING HERBORA ASSISTANT BUTTON

Add a floating circular assistant button in the bottom-right corner of the homepage, matching the reference image.

The button should:

 Use green botanical branding.

 Have a circular shape.

 Include a friendly assistant or botanical-inspired icon.

 Remain visible without obstructing important content.

 Have a subtle hover effect.

 Be responsive on mobile.

For the initial version, clicking it may open a simple assistant panel or display a clearly marked coming-soon state.

Do not implement a full AI chatbot unless separately requested.

9. PLANTOPEDIA

Create a dedicated Plantopedia page using the same Herbora design language.

Plantopedia is the central database for Ayurvedic and medicinal plants.

Required Features

 Display plant cards.

 Search plants by common name.

 Search by scientific name.

 Search by Ayurvedic name where available.

 Filter plants using available categories.

 Sort plants alphabetically.

 Open plant details.

 Save plants to My Plant DB.

 Display loading, empty, and error states.

Plant Cards

Each card should include:

 Plant image.

 Common name.

 Scientific name.

 Ayurvedic name if available.

 Short description.

 View Details button.

 Save Plant button.

Use the same cream, green, and botanical visual style as the homepage.

Plant Details Page

Display available information such as:

 Common name.

 Scientific name.

 Ayurvedic name.

 Regional names.

 Plant images.

 Botanical description.

 Traditional Ayurvedic significance.

 Traditionally documented uses.

 Plant parts traditionally used.

 Habitat.

 Cultivation information.

 Safety information.

 Source references.

 Educational disclaimer.

Do not fabricate plant information.

If a field is unavailable, display a suitable empty state.

Traditional Ayurvedic uses must not be presented as guaranteed medical treatments.

10. MY PLANT DB

Create a page called My Plant DB.

This feature allows authenticated users to save plants they discover in Plantopedia.

User Flow

 User logs in.

 User opens Plantopedia.

 User clicks Save Plant.

 The plant is stored in the user's personal collection.

 The plant appears in My Plant DB.

 The user can view or remove the saved plant.

Required Features

 Display saved plants.

 Remove saved plants.

 Open plant details.

 Show an empty state for new users.

 Require authentication.

 Protect private user data.

If the user is not logged in, show a clear login prompt with Login and Sign Up buttons.

Keep the feature extensible for future additions such as personal notes and plant observations, but do not implement those yet.

11. IDENTIFY A PLANT

Create a dedicated Identify a Plant page.

This feature allows users to upload or capture a plant image.

User Flow

 User opens Identify a Plant.

 User uploads an image or uses the camera on a supported device.

 The frontend validates the image.

 The image is sent to the Flask backend.

 The backend processes it through the configured plant-identification API or model.

 The system receives a prediction.

 The prediction is matched against Herbora's plant database.

 The user sees the result and can open the relevant Plantopedia entry.

Interface

Include:

 Upload image button.

 Drag-and-drop upload.

 Camera capture option.

 Image preview.

 Replace image button.

 Remove image button.

 Identify Plant button.

 Processing indicator.

 Error messages.

 Retry button.

 Result card.

Results

Display:

 Predicted plant name.

 Scientific name if available.

 Confidence score if supplied.

 Database match status.

 View Plant Details button.

If the plant cannot be identified confidently, clearly communicate uncertainty.

If no matching Herbora plant exists, do not fabricate Ayurvedic information.

12. AUTHENTICATION

Use Supabase Authentication.

Create:

Login Page

 Email.

 Password.

 Login button.

 Google login if configured.

 Forgot password.

 Link to Sign Up.

 Validation messages.

 Loading state.

Sign Up Page

 Name if required.

 Email.

 Password.

 Confirm password.

 Sign Up button.

 Google authentication if configured.

 Link to Login.

 Validation messages.

Account Page

 Basic user information.

 Logout button.

 Authentication status.

13. DATABASE AND BACKEND

Use:

 Flask.

 SQLAlchemy.

 Supabase PostgreSQL.

Suggested Database Tables

plants

id
common_name
scientific_name
ayurvedic_name
description
traditional_uses
plant_parts_used
habitat
cultivation_information
safety_information
image_url
source_references
created_at
updated_at

user_saved_plants

id
user_id
plant_id
created_at

plant_identification_results

Create this only if identification history is required.

id
user_id
predicted_name
confidence_score
matched_plant_id
status
created_at

Use appropriate relationships and constraints.

Users must only be able to access their own saved plants and private records.

14. FLASK API

Create a simple REST API.

Suggested endpoints:

GET    /api/plants
GET    /api/plants/<id>
GET    /api/plants/search
POST   /api/plants/<id>/save
DELETE /api/plants/<id>/save
GET    /api/my-plants
POST   /api/identify
GET    /api/health

Use:

 JSON responses.

 Input validation.

 Appropriate HTTP status codes.

 Secure authentication handling.

 Clear error responses.

 Environment variables for secrets.

Do not expose internal stack traces or API keys.

15. SIMPLE PROJECT STRUCTURE

Use a straightforward structure that is easy for a college team to understand.

herbora/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   ├── services.py
│   ├── requirements.txt
│   └── .env
│
├── database/
│   └── schema.sql
│
├── .env.example
├── .gitignore
└── README.md

Do not overcomplicate the architecture.

16. RESPONSIVENESS AND ACCESSIBILITY

The website must work properly on:

 Mobile phones.

 Tablets.

 Laptops.

 Desktop screens.

Ensure:

 Responsive navigation.

 Mobile menu.

 Responsive hero layout.

 Responsive feature cards.

 Touch-friendly buttons.

 No horizontal scrolling.

 Proper image scaling.

 Readable typography.

 Accessible form labels.

 Alt text for meaningful images.

 Keyboard-accessible interactive elements.

The mobile design should preserve the same visual identity as the desktop reference.

17. PERFORMANCE AND SECURITY

Performance

 Optimize images.

 Use lazy loading where appropriate.

 Avoid unnecessary API requests.

 Use loading states.

 Keep image processing from blocking the interface.

 Use pagination for large plant collections.

Security

 Never expose secret API keys in frontend code.

 Validate uploaded files.

 Restrict private database access.

 Protect authenticated routes.

 Use Supabase Authentication correctly.

 Handle API failures safely.

 Do not display technical errors to users.

18. CONTENT AND HEALTH DISCLAIMER

Herbora is an educational platform.

Do not:

 Diagnose diseases.

 Prescribe medicines.

 Recommend dosages.

 Claim guaranteed health benefits.

 Present traditional knowledge as scientifically proven treatment.

 Invent plant information.

 Present AI predictions as certain facts.

Include a clear educational disclaimer where appropriate.

19. RESTRICTIONS

Do not:

 Change the homepage design from the attached reference.

 Replace the attached logo.

 Use a generic website template.

 Add unnecessary frameworks.

 Add payment gateways.

 Add e-commerce.

 Add an online pharmacy.

 Add unrelated social features.

 Add a complex admin dashboard.

 Add features that have not yet been specified.

 Use fake AI identification results in production.

 Hardcode API keys.

 Build unnecessary microservices.

 Overcomplicate the codebase.

20. IMPORTANT IMPLEMENTATION INSTRUCTIONS FOR LOVABLE

 Treat the attached homepage image as the primary UI/UX reference.

 Treat the attached Herbora logo as the official brand asset.

 Recreate the homepage layout, text, cards, imagery, colors, and spacing as faithfully as possible.

 Use the exact homepage text provided in the reference.

 Preserve the natural cream-and-green visual identity throughout the other pages.

 Use reusable React components for the header, navigation, plant cards, buttons, feature cards, footer, and layout.

 Do not replace the reference design with a different design system.

 Build the homepage first and ensure it closely matches the reference before implementing the other pages.

 Use realistic botanical imagery that matches the reference. If the attached imagery cannot be directly reused, create visually similar botanical compositions.

 Keep the code simple and maintainable.

 Do not claim that backend or AI functionality is working unless the required services are actually configured.

 Use clear setup instructions for Supabase, Flask, SQLAlchemy, and any image-processing API.

 Make the architecture easy to extend when I provide additional Herbora features.

21. FINAL DELIVERABLE

Generate a complete, functional Herbora website containing:

 A homepage closely matching the attached reference image.

 The official attached Herbora logo.

 The exact homepage hero text and feature-card text.

 Matching botanical imagery and visual styling.

 Responsive navigation and search.

 Plantopedia.

 My Plant DB.

 Identify a Plant.

 Authentication pages.

 Flask backend structure.

 Supabase PostgreSQL integration.

 SQLAlchemy database operations.

 AI plant image-processing integration structure.

 Responsive design.

 Loading, empty, and error states.

 Secure environment configuration.

 Clear setup instructions.

The most important requirement is visual fidelity: the Herbora homepage must closely resemble the attached reference image in layout, typography, colors, imagery, spacing, and overall UI/UX. Preserve the same aesthetic across the entire website.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8843b9db-8737-4cd3-9326-479f428307fd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
