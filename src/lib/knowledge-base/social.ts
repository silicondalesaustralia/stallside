import type { KnowledgeArticle } from "./types";

export const socialArticles: KnowledgeArticle[] = [
  {
    slug: "social-overview",
    title: "Social: make and post content",
    summary:
      "Create branded posts about your products, then post them now, schedule them, or download them to post yourself.",
    keywords: ["social", "instagram", "facebook", "tiktok", "marketing", "post", "content"],
    related: ["social-create-post", "social-ai-images", "social-connections", "social-planner"],
    availability: "Coming soon",
    ctas: [],
    steps: [
      "Open Social in the sidebar. The tabs are Create, Library, Planner, Posts, Calendar, Connections and Brand.",
      "Brand: set your colours and upload your logos once so every post matches.",
      "Connections: link the accounts you want Vendl to post to for you.",
      "Create: pick where to post, add a photo or video, write a caption, then post now or schedule.",
      "Library keeps your images and videos, Planner builds a week of posts at once, and Posts and Calendar show what's going out.",
    ],
    tips: [
      "Connecting accounts is optional. You can always download an image, copy the caption and post it yourself.",
      "Social works for the business you have selected.",
    ],
  },
  {
    slug: "social-create-post",
    title: "Create and send a post",
    summary:
      "Pick platforms, add a photo, link a product or pre-order page, write a caption, and post or schedule.",
    keywords: ["create", "compose", "caption", "schedule", "post now", "photo", "write for me"],
    related: ["social-ai-images", "social-posts-calendar", "social-connections"],
    availability: "Coming soon",
    ctas: [],
    steps: [
      "Open Social → Create. Under Where should it go?, pick Facebook, Instagram or TikTok. Connected accounts are picked for you.",
      "Under Add a photo or video, search What's this post about? and pick a product, pre-order page or subscription. The AI uses its details and can use its photos.",
      "Add an image with Upload photo, From Library, or Create with AI.",
      "Under Write a caption, tap Write for me (or Try another), then edit it. The shortest limit of your chosen platforms applies.",
      "Choose Post now, or Schedule and pick a time (Tonight 7pm, Tomorrow 7am, or your own). Times use your business's timezone.",
      "Tap Post or Schedule. You'll land on Posts, where you can see whether it worked.",
    ],
    tips: [
      "Post now needs every chosen platform connected. If one isn't, schedule it instead and it's added to your calendar as a manual post to do yourself.",
      "Videos post automatically to TikTok only. For other platforms, download the video from Library and post it yourself.",
    ],
  },
  {
    slug: "social-ai-images",
    title: "Create images with AI",
    summary:
      "Build a layout from your own photos, describe an idea and get three designs, or recreate a post you like.",
    keywords: ["ai", "design", "image", "layout", "recreate", "inspiration", "render", "infographic", "quote card"],
    related: ["social-create-post", "social-brand", "social-library"],
    availability: "Coming soon",
    ctas: [],
    steps: [
      "In Social → Create, tap Create with AI. Choose how you want to create.",
      "Use your photos & videos (Build a layout): pick a product or offer, choose Scene, Infographic or Quote card, choose a photo, and tap Generate. You can regenerate, change style, or pick from three captions.",
      "Start from your idea (AI Designed): describe what to promote, optionally use photos from a product, and tap Create 3 versions. Pick the one you like.",
      "Use a post you like (Recreate): upload a screenshot of a post you like. Vendl uses its style as inspiration for your business, not as a copy.",
      "When you have an image you like, tap Use this image to bring it back to your post.",
    ],
    tips: [
      "Open Post defaults at the top of Create with AI to set your brand voice and default call to action for new posts.",
      "For Instagram and Facebook posts, use a screenshot. Links to those sites can't be read.",
      "Changing the logo on a finished design and writing captions don't create a new image.",
      "Only use real photos of your own products.",
    ],
  },
];
