from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from models.hero_settings import HeroSettings
from models.site_settings import SiteSettings
from bson import ObjectId
from fastapi import Depends
from services.db_service import get_database


class StaticContentService:
    def __init__(self, database: AsyncIOMotorClient):
        self.collection: AsyncIOMotorCollection = database["settings"] # Using 'settings' collection

    async def get_hero_settings(self) -> HeroSettings:
        # Try to find the hero settings document
        settings_doc = await self.collection.find_one({"settings_id": "hero_settings"})
        if settings_doc:
            return HeroSettings.parse_obj(settings_doc)
        else:
            # If not found, create a default one
            default_settings = HeroSettings(
                hero_background_image_url="https://images.unsplash.com/photo-1531297484001-80022131f5a1",
                hero_personal_photo_url="https://img8.uploadhouse.com/fileuploads/31936/31936778eb4b70130f3289122781a71f94414143.jpg",
                hero_main_title="Angelo",
                hero_subtitle="Creative Developer",
                hero_bio_content="大學時期的我，在課餘時間擔任過吉他社團老師、咖啡師、以及軟體新創業務。除了喜歡把雜亂的知識收斂成系統後與他人分享，更在實習過程中收穫了很好的簡報/提案/思考能力。而拜於學校重視數據驅動的趨勢，我也培養了不錯的數理能力，也從中發現了用程式解決現實問題的樂趣，因此點燃了我對技術的熱情。除了本科的數理統計/統計分析，更跨系修習了許多程式相關的課程，以展現學習積極/以及學習能力，詳情可以參考[我的成績單](https://drive.google.com/file/d/1rKGg4z_ZxPkvfL82YNfv-tEenXQ0Zn7b/view?usp=share_link)，也在畢業前與畢業後分別並參與了ccClub/職訓局這兩個非常扎實的coding bootcamp.\n\n積極求職的現在，深知轉職軟體工程是一條艱辛、需要持續學習的路程，我積極探索各種技術領域，持續打造能夠真正解決問題的作品集。",
                hero_button_1_label="查看作品集",
                hero_button_2_label="與我聯繫"
            )
            inserted_id = await self.collection.insert_one(default_settings.dict(by_alias=True))
            default_settings.id = inserted_id.inserted_id
            return default_settings

    async def update_hero_settings(self, settings: HeroSettings) -> HeroSettings:
        # Update the existing hero settings document
        # We use 'settings_id' as the unique identifier for the update
        updated_doc = await self.collection.find_one_and_update(
            {"settings_id": "hero_settings"},
            {"$set": settings.dict(by_alias=True, exclude={"id"})}, # Exclude 'id' from update payload
            return_document=True, # Return the updated document
            upsert=True # Create the document if it doesn't exist
        )
        if updated_doc:
            return HeroSettings.parse_obj(updated_doc)
        return None # Should ideally not happen if get_hero_settings creates it

    async def get_site_settings(self) -> SiteSettings:
        settings_doc = await self.collection.find_one({"settings_id": "site_settings"})
        if settings_doc:
            return SiteSettings.parse_obj(settings_doc)
        else:
            default_settings = SiteSettings(
                contact_email="angelo@example.com",
                contact_phone="+886 912 345 678",
                contact_location="Taipei, Taiwan",
                social_github="https://github.com/angeloange?tab=repositories",
                social_instagram="https://www.instagram.com/angelo__1016/",
                social_youtube="https://www.youtube.com/@Happywecan",
                portfolio_title="Selected Work",
                portfolio_subtitle="A collection of projects exploring the intersection of design, code, and interaction.",
                blog_title="Insights",
                nav_brand_primary="Angelo",
                nav_brand_secondary="Studio",
                nav_mobile_caption="Product-minded frontend, full-stack implementation, and writing from Taiwan.",
                nav_home_label="Home",
                nav_about_label="About",
                nav_skills_label="Skills",
                nav_portfolio_label="Work",
                nav_blog_label="Blog",
                nav_contact_label="Contact",
                intro_splash_enabled=True,
                intro_splash_keywords="DX, 破格升職, 考績優異",
                section_hero_enabled=True,
                section_hero_order=1,
                section_about_enabled=True,
                section_about_order=2,
                section_skills_enabled=True,
                section_skills_order=3,
                section_portfolio_enabled=True,
                section_portfolio_order=4,
                section_blog_enabled=True,
                section_blog_order=5,
                section_contact_enabled=True,
                section_contact_order=6,
                about_image_url="/static/uploads/4e0a62f8-a2e5-4eb8-9f9e-88cb0819e66c.jpg",
                about_eyebrow="About / Positioning",
                about_title="Manufacturing AI / DX / Backend Integration Engineer",
                about_summary="Non-CS business background, Python training, and hands-on internal systems work. I connect business process, manufacturing context, automation, AI knowledge bases, permissions, and backend systems.",
                about_body="My strongest value is not only writing code. It is translating real company workflows into usable systems: RAG knowledge bases, CRUD tools, document automation, permission rules, and internal integrations that help teams move faster.",
                about_photo_caption="Building from business workflow to production-ready system detail",
                stat_1_value="AI / DX",
                stat_1_label="Career direction",
                stat_2_value="Backend",
                stat_2_label="System foundation",
                stat_3_value="Manufacturing",
                stat_3_label="Domain context",
                focus_1_label="AI / RAG",
                focus_1_title="Enterprise knowledge systems",
                focus_1_body="Dify, RAG, internal document upload, source citation, department labels, and knowledge workflows for real business users.",
                focus_2_label="Backend / Security",
                focus_2_title="Internal systems with permission logic",
                focus_2_body="CRUD systems, JWT, SSO concepts, RBAC, department-level data access, audit logs, and API security as the next engineering threshold.",
                focus_3_label="DX / Automation",
                focus_3_title="Workflow automation for manufacturing teams",
                focus_3_body="Announcement crawlers, file conversion, data cleanup, auto-upload pipelines, and cross-department requirement translation.",
                skills_eyebrow="Stack index",
                skills_title="Skills",
                skills_stack_label="Primary stack",
                skills_core_stack="Next.js, React, TypeScript, FastAPI, MongoDB, Docker",
                skills_default_description="Tools and practices used to turn ideas into maintainable shipped work.",
                skills_frontend_description="Interfaces, component systems, motion, and responsive product screens.",
                skills_backend_description="API design, data modeling, authentication, and operational reliability.",
                skills_collaboration_description="Documentation, handoff quality, product thinking, and team workflows.",
                skills_analytics_description="Performance, measurement, iteration, and decision support.",
                portfolio_kicker="Portfolio / selected case studies / shipped work",
                portfolio_empty_eyebrow="Portfolio library",
                portfolio_empty_title="Case studies are ready for your first projects.",
                portfolio_empty_body="Add work from the admin panel with a problem, role, process, stack, result, and links. The layout is designed to make each project read like a professional case study.",
                portfolio_item_button_label="View",
                portfolio_default_tag="Development",
                blog_subtitle="A place for technical notes, product decisions, and personal operating principles. Start with fewer articles, but make each one worth keeping.",
                blog_empty_eyebrow="Journal system",
                blog_empty_title="The writing shelf is ready.",
                blog_empty_body="Use the admin panel to publish long-form notes. Good first topics: this website build, Docker development workflow, FastAPI API design, and MongoDB content modeling.",
                blog_item_button_label="Read",
                blog_draft_label="Draft",
                detail_blog_back_label="Back to journal",
                detail_blog_eyebrow="Journal",
                detail_blog_not_found="Article not found",
                detail_portfolio_back_label="Back to portfolio",
                detail_portfolio_eyebrow="Case study",
                detail_portfolio_not_found="Project not found",
                contact_title="Contact",
                contact_intro_label="Get in touch",
                contact_location_label="Location",
                contact_name_label="01 / What's your name?",
                contact_name_placeholder="NAME",
                contact_email_label="02 / What's your email?",
                contact_email_placeholder="EMAIL",
                contact_message_label="03 / Your message",
                contact_message_placeholder="MESSAGE",
                contact_submit_label="Send",
                contact_submitting_label="Sending",
                contact_socials_label="Socials",
                contact_footer_note="© 2026 Angelo — Created with Passion",
                contact_footer_stack="Built with Next.js & GSAP",
                contact_local_time_label="Local Time"
            )
            inserted_id = await self.collection.insert_one(default_settings.dict(by_alias=True))
            default_settings.id = inserted_id.inserted_id
            return default_settings

    async def update_site_settings(self, settings: SiteSettings) -> SiteSettings:
        updated_doc = await self.collection.find_one_and_update(
            {"settings_id": "site_settings"},
            {"$set": settings.dict(by_alias=True, exclude={"id"})},
            return_document=True,
            upsert=True
        )
        if updated_doc:
            return SiteSettings.parse_obj(updated_doc)
        return None


# Dependency to get the StaticContentService
async def get_static_content_service(database: AsyncIOMotorClient = Depends(get_database)) -> StaticContentService:
    return StaticContentService(database)
