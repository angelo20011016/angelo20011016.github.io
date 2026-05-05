from typing import Optional
from pydantic import BaseModel, Field
from models.objectid_model import PydanticObjectId
from bson import ObjectId

class SiteSettings(BaseModel):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    settings_id: str = Field("site_settings", alias="settings_id")
    
    # Contact Info
    contact_email: str = Field(..., description="Contact Email")
    contact_phone: str = Field(..., description="Contact Phone Number")
    contact_location: str = Field(..., description="Contact Location")
    
    # Social Links
    social_github: str = Field(..., description="GitHub Profile URL")
    social_instagram: str = Field(..., description="Instagram Profile URL")
    social_youtube: str = Field(..., description="YouTube Profile URL")

    # Section Titles (optional)
    portfolio_title: str = Field("Selected Work", description="Portfolio Section Title")
    portfolio_subtitle: str = Field("A collection of projects exploring the intersection of design, code, and interaction.", description="Portfolio Section Subtitle")
    blog_title: str = Field("Insights", description="Blog Section Title")

    # Global Navigation / Labels
    nav_brand_primary: str = Field("Angelo", description="Primary brand label in navigation")
    nav_brand_secondary: str = Field("Studio", description="Secondary brand hover label in navigation")
    nav_mobile_caption: str = Field("Product-minded frontend, full-stack implementation, and writing from Taiwan.", description="Mobile navigation caption")
    nav_home_label: str = Field("Home", description="Home navigation label")
    nav_about_label: str = Field("About", description="About navigation label")
    nav_skills_label: str = Field("Skills", description="Skills navigation label")
    nav_portfolio_label: str = Field("Work", description="Portfolio navigation label")
    nav_blog_label: str = Field("Blog", description="Blog navigation label")
    nav_contact_label: str = Field("Contact", description="Contact navigation label")

    # Homepage Section Builder
    section_hero_enabled: bool = Field(True, description="Show hero section on homepage")
    section_hero_order: int = Field(1, description="Hero section order")
    section_about_enabled: bool = Field(True, description="Show about section on homepage")
    section_about_order: int = Field(2, description="About section order")
    section_skills_enabled: bool = Field(True, description="Show skills section on homepage")
    section_skills_order: int = Field(3, description="Skills section order")
    section_portfolio_enabled: bool = Field(True, description="Show portfolio section on homepage")
    section_portfolio_order: int = Field(4, description="Portfolio section order")
    section_blog_enabled: bool = Field(True, description="Show blog section on homepage")
    section_blog_order: int = Field(5, description="Blog section order")
    section_contact_enabled: bool = Field(True, description="Show contact section on homepage")
    section_contact_order: int = Field(6, description="Contact section order")

    # About / Positioning Section
    about_image_url: str = Field("/static/uploads/4e0a62f8-a2e5-4eb8-9f9e-88cb0819e66c.jpg", description="About section image URL")
    about_eyebrow: str = Field("About / Positioning", description="About section eyebrow")
    about_title: str = Field("Manufacturing AI / DX / Backend Integration Engineer", description="About section title")
    about_summary: str = Field("Non-CS business background, Python training, and hands-on internal systems work. I connect business process, manufacturing context, automation, AI knowledge bases, permissions, and backend systems.", description="About section summary")
    about_body: str = Field("My strongest value is not only writing code. It is translating real company workflows into usable systems: RAG knowledge bases, CRUD tools, document automation, permission rules, and internal integrations that help teams move faster.", description="About section body")
    about_photo_caption: str = Field("Building from business workflow to production-ready system detail", description="About photo caption")
    stat_1_value: str = Field("AI / DX", description="About stat 1 value")
    stat_1_label: str = Field("Career direction", description="About stat 1 label")
    stat_2_value: str = Field("Backend", description="About stat 2 value")
    stat_2_label: str = Field("System foundation", description="About stat 2 label")
    stat_3_value: str = Field("Manufacturing", description="About stat 3 value")
    stat_3_label: str = Field("Domain context", description="About stat 3 label")
    focus_1_label: str = Field("AI / RAG", description="Focus area 1 label")
    focus_1_title: str = Field("Enterprise knowledge systems", description="Focus area 1 title")
    focus_1_body: str = Field("Dify, RAG, internal document upload, source citation, department labels, and knowledge workflows for real business users.", description="Focus area 1 body")
    focus_2_label: str = Field("Backend / Security", description="Focus area 2 label")
    focus_2_title: str = Field("Internal systems with permission logic", description="Focus area 2 title")
    focus_2_body: str = Field("CRUD systems, JWT, SSO concepts, RBAC, department-level data access, audit logs, and API security as the next engineering threshold.", description="Focus area 2 body")
    focus_3_label: str = Field("DX / Automation", description="Focus area 3 label")
    focus_3_title: str = Field("Workflow automation for manufacturing teams", description="Focus area 3 title")
    focus_3_body: str = Field("Announcement crawlers, file conversion, data cleanup, auto-upload pipelines, and cross-department requirement translation.", description="Focus area 3 body")

    # Skills Section
    skills_eyebrow: str = Field("Stack index", description="Skills section eyebrow")
    skills_title: str = Field("Skills", description="Skills section title")
    skills_stack_label: str = Field("Primary stack", description="Skills stack label")
    skills_core_stack: str = Field("Next.js, React, TypeScript, FastAPI, MongoDB, Docker", description="Comma-separated core stack")
    skills_default_description: str = Field("Tools and practices used to turn ideas into maintainable shipped work.", description="Default skill category description")
    skills_frontend_description: str = Field("Interfaces, component systems, motion, and responsive product screens.", description="Frontend skill description")
    skills_backend_description: str = Field("API design, data modeling, authentication, and operational reliability.", description="Backend skill description")
    skills_collaboration_description: str = Field("Documentation, handoff quality, product thinking, and team workflows.", description="Collaboration skill description")
    skills_analytics_description: str = Field("Performance, measurement, iteration, and decision support.", description="Analytics skill description")

    # Portfolio Section
    portfolio_kicker: str = Field("Portfolio / selected case studies / shipped work", description="Portfolio section kicker")
    portfolio_empty_eyebrow: str = Field("Portfolio library", description="Portfolio empty state eyebrow")
    portfolio_empty_title: str = Field("Case studies are ready for your first projects.", description="Portfolio empty state title")
    portfolio_empty_body: str = Field("Add work from the admin panel with a problem, role, process, stack, result, and links. The layout is designed to make each project read like a professional case study.", description="Portfolio empty state body")
    portfolio_item_button_label: str = Field("View", description="Portfolio item button label")
    portfolio_default_tag: str = Field("Development", description="Portfolio default tag")

    # Blog Section
    blog_subtitle: str = Field("A place for technical notes, product decisions, and personal operating principles. Start with fewer articles, but make each one worth keeping.", description="Blog section subtitle")
    blog_empty_eyebrow: str = Field("Journal system", description="Blog empty state eyebrow")
    blog_empty_title: str = Field("The writing shelf is ready.", description="Blog empty state title")
    blog_empty_body: str = Field("Use the admin panel to publish long-form notes. Good first topics: this website build, Docker development workflow, FastAPI API design, and MongoDB content modeling.", description="Blog empty state body")
    blog_item_button_label: str = Field("Read", description="Blog item button label")
    blog_draft_label: str = Field("Draft", description="Blog draft label")

    # Detail Pages
    detail_blog_back_label: str = Field("Back to journal", description="Blog detail back label")
    detail_blog_eyebrow: str = Field("Journal", description="Blog detail eyebrow")
    detail_blog_not_found: str = Field("Article not found", description="Blog not found text")
    detail_portfolio_back_label: str = Field("Back to portfolio", description="Portfolio detail back label")
    detail_portfolio_eyebrow: str = Field("Case study", description="Portfolio detail eyebrow")
    detail_portfolio_not_found: str = Field("Project not found", description="Portfolio not found text")

    # Contact Section
    contact_title: str = Field("Contact", description="Contact section title")
    contact_intro_label: str = Field("Get in touch", description="Contact intro label")
    contact_location_label: str = Field("Location", description="Contact location label")
    contact_name_label: str = Field("01 / What's your name?", description="Contact form name label")
    contact_name_placeholder: str = Field("NAME", description="Contact form name placeholder")
    contact_email_label: str = Field("02 / What's your email?", description="Contact form email label")
    contact_email_placeholder: str = Field("EMAIL", description="Contact form email placeholder")
    contact_message_label: str = Field("03 / Your message", description="Contact form message label")
    contact_message_placeholder: str = Field("MESSAGE", description="Contact form message placeholder")
    contact_submit_label: str = Field("Send", description="Contact submit label")
    contact_submitting_label: str = Field("Sending", description="Contact submitting label")
    contact_socials_label: str = Field("Socials", description="Contact socials label")
    contact_footer_note: str = Field("© 2026 Angelo — Created with Passion", description="Contact footer note")
    contact_footer_stack: str = Field("Built with Next.js & GSAP", description="Contact footer stack")
    contact_local_time_label: str = Field("Local Time", description="Contact local time label")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
