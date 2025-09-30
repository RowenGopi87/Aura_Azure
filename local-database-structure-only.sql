/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: aura_playground
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `audit_config`
--

DROP TABLE IF EXISTS `audit_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_by` varchar(36) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_name` (`setting_name`),
  KEY `updated_by` (`updated_by`),
  KEY `idx_setting_name` (`setting_name`),
  CONSTRAINT `audit_config_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_events`
--

DROP TABLE IF EXISTS `audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_events` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `session_id` varchar(36) DEFAULT NULL,
  `event_type` enum('generation','edit','save','delete','export','integration','view','search','ai_enhancement') NOT NULL,
  `feature_category` enum('brief','initiative','feature','epic','story','code','design','test','auth','system') NOT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `resource_title` varchar(500) DEFAULT NULL,
  `generation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`generation_data`)),
  `prompt_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prompt_data`)),
  `ai_model_used` varchar(50) DEFAULT NULL,
  `generation_time_ms` int(11) DEFAULT NULL,
  `before_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before_content`)),
  `after_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after_content`)),
  `edit_type` enum('minor','major','complete_rewrite') DEFAULT NULL,
  `fields_changed` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fields_changed`)),
  `was_saved` tinyint(1) DEFAULT 0,
  `was_exported` tinyint(1) DEFAULT 0,
  `was_integrated` tinyint(1) DEFAULT 0,
  `integration_target` varchar(50) DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `referrer_url` varchar(500) DEFAULT NULL,
  `browser_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`browser_info`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `user_satisfaction_score` int(11) DEFAULT NULL,
  `content_quality_score` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_feature_category` (`feature_category`),
  KEY `idx_action` (`action`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_was_saved` (`was_saved`),
  KEY `idx_was_exported` (`was_exported`),
  KEY `idx_was_integrated` (`was_integrated`),
  KEY `idx_audit_events_comprehensive` (`user_id`,`feature_category`,`event_type`,`created_at`),
  CONSTRAINT `audit_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_ai_consolidations`
--

DROP TABLE IF EXISTS `aurav2_ai_consolidations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_ai_consolidations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `consolidation_type` enum('stage_optimization','requirement_analysis','risk_assessment','estimation_refinement') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `input_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`input_data`)),
  `ai_recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`ai_recommendations`)),
  `confidence_score` decimal(3,2) DEFAULT NULL,
  `human_review_status` enum('pending','approved','rejected','modified') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'pending',
  `human_reviewer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `implementation_status` enum('pending','applied','discarded') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_business_brief_extensions`
--

DROP TABLE IF EXISTS `aurav2_business_brief_extensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_business_brief_extensions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `workflow_type` enum('new_system','enhancement') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `estimation_size` enum('xxs','xs','s','m','l','xl','xxl') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `estimation_confidence` enum('bronze','silver','gold') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `build_or_buy_decision` enum('build','buy','enhance','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'pending',
  `rfi_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rfi_data`)),
  `capacity_planning` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`capacity_planning`)),
  `discovery_findings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`discovery_findings`)),
  `quality_score` decimal(3,2) DEFAULT NULL,
  `ai_analysis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_analysis`)),
  `stakeholder_alignment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stakeholder_alignment`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `applied_recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Track applied AI recommendations with timestamps' CHECK (json_valid(`applied_recommendations`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_qualified_ideas`
--

DROP TABLE IF EXISTS `aurav2_qualified_ideas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_qualified_ideas` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `qualification_score` decimal(3,2) NOT NULL,
  `market_demand` int(11) DEFAULT 5,
  `technical_feasibility` int(11) DEFAULT 5,
  `business_value` int(11) DEFAULT 5,
  `resource_availability` int(11) DEFAULT 5,
  `strategic_alignment` int(11) DEFAULT 5,
  `risk_level` int(11) DEFAULT 5,
  `complexity` int(11) DEFAULT 5,
  `effort` int(11) DEFAULT 5,
  `market_impact` int(11) DEFAULT 5,
  `priority` int(11) DEFAULT 999,
  `market_research` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `competitor_analysis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `technical_assessment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_case` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `risk_assessment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `recommended_action` enum('proceed','research_more','decline','defer') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `qualified_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `estimated_roi` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `time_to_market` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `resource_requirement` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `portfolio_quarter` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_user_roles`
--

DROP TABLE IF EXISTS `aurav2_user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_user_roles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `role` enum('product_owner','product_manager','portfolio_manager','delivery_manager','business_owner','art_leadership','initiative_lead') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_workflow_progress`
--

DROP TABLE IF EXISTS `aurav2_workflow_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_workflow_progress` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `workflow_type` enum('new_system','enhancement') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `current_stage_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `stage_completion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stage_completion`)),
  `stage_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stage_history`)),
  `ai_recommendations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_recommendations`)),
  `consolidation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`consolidation_data`)),
  `estimated_completion_date` date DEFAULT NULL,
  `actual_completion_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aurav2_workflow_stages`
--

DROP TABLE IF EXISTS `aurav2_workflow_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `aurav2_workflow_stages` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `workflow_type` enum('new_system','enhancement','both') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'both',
  `definition_of_ready` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`definition_of_ready`)),
  `key_players` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`key_players`)),
  `definition_of_done` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`definition_of_done`)),
  `activities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`activities`)),
  `reference_documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reference_documents`)),
  `ai_consolidation_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_briefs`
--

DROP TABLE IF EXISTS `business_briefs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_briefs` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `lead_business_unit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `additional_business_units` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `primary_strategic_theme` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_objective` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `quantifiable_business_outcomes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `in_scope` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `out_of_scope` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impact_of_do_nothing` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `happy_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `exceptions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impacted_end_users` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `change_impact_expected` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impact_to_other_departments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `other_departments_impacted` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `impacts_existing_technology` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `technology_solutions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `relevant_business_owners` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `other_technology_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `supporting_documents` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `submitted_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','submitted','in_review','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'draft',
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `code_items`
--

DROP TABLE IF EXISTS `code_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `code_items` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `work_item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `work_item_type` enum('feature','epic','story') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `language` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_department_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `parent_department_id` (`parent_department_id`),
  KEY `idx_department_name` (`name`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`parent_department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `designs`
--

DROP TABLE IF EXISTS `designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `designs` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `work_item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `work_item_type` enum('feature','epic','story') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `design_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_by` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `processed` tinyint(1) DEFAULT 0,
  `processed_at` timestamp NULL DEFAULT NULL,
  `extracted_text` longtext DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `epics`
--

DROP TABLE IF EXISTS `epics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `epics` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `feature_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `story_points` int(11) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS `features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `features` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `initiative_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `story_points` int(11) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generation_analytics`
--

DROP TABLE IF EXISTS `generation_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `generation_analytics` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `feature_category` enum('brief','initiative','feature','epic','story','code','design','test') NOT NULL,
  `resource_id` varchar(36) NOT NULL,
  `total_generations` int(11) DEFAULT 0,
  `generations_kept_without_edit` int(11) DEFAULT 0,
  `generations_edited` int(11) DEFAULT 0,
  `generations_deleted` int(11) DEFAULT 0,
  `minor_edits` int(11) DEFAULT 0,
  `major_edits` int(11) DEFAULT 0,
  `complete_rewrites` int(11) DEFAULT 0,
  `ai_enhancements` int(11) DEFAULT 0,
  `saves_count` int(11) DEFAULT 0,
  `exports_count` int(11) DEFAULT 0,
  `integrations_count` int(11) DEFAULT 0,
  `first_generated_at` timestamp NULL DEFAULT NULL,
  `last_modified_at` timestamp NULL DEFAULT NULL,
  `total_time_spent_minutes` int(11) DEFAULT 0,
  `avg_generation_time_ms` int(11) DEFAULT 0,
  `avg_content_quality_score` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_resource` (`user_id`,`feature_category`,`resource_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_feature_category` (`feature_category`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_generation_analytics_reporting` (`feature_category`,`created_at`,`total_generations`),
  CONSTRAINT `generation_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `initiatives`
--

DROP TABLE IF EXISTS `initiatives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `initiatives` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `business_brief_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `business_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `estimated_value` decimal(10,2) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `portfolio_id` varchar(36) DEFAULT NULL,
  KEY `idx_portfolio_id` (`portfolio_id`),
  CONSTRAINT `initiatives_ibfk_1` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organizational_levels`
--

DROP TABLE IF EXISTS `organizational_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizational_levels` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `hierarchy_order` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_hierarchy_order` (`hierarchy_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permission_types`
--

DROP TABLE IF EXISTS `permission_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission_types` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `portfolios`
--

DROP TABLE IF EXISTS `portfolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolios` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `function` text DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prompt_analytics`
--

DROP TABLE IF EXISTS `prompt_analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prompt_analytics` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `feature_category` enum('brief','initiative','feature','epic','story','code','design','test') NOT NULL,
  `prompt_text` text NOT NULL,
  `keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`keywords`)),
  `prompt_length` int(11) DEFAULT NULL,
  `complexity_score` decimal(3,2) DEFAULT NULL,
  `success_rate` decimal(3,2) DEFAULT NULL,
  `avg_generation_time_ms` int(11) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_feature_category` (`feature_category`),
  KEY `idx_keywords` (`keywords`(768)),
  KEY `idx_usage_count` (`usage_count`),
  CONSTRAINT `prompt_analytics_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `role_permission_matrix`
--

DROP TABLE IF EXISTS `role_permission_matrix`;
/*!50001 DROP VIEW IF EXISTS `role_permission_matrix`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `role_permission_matrix` AS SELECT
 1 AS `role_id`,
  1 AS `role_name`,
  1 AS `role_display_name`,
  1 AS `organizational_level`,
  1 AS `department`,
  1 AS `module_name`,
  1 AS `module_display_name`,
  1 AS `can_access`,
  1 AS `can_read`,
  1 AS `can_write`,
  1 AS `can_delete`,
  1 AS `can_admin` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `module_id` varchar(36) NOT NULL,
  `permission_type_id` varchar(36) NOT NULL,
  `can_access` tinyint(1) DEFAULT 0,
  `can_read` tinyint(1) DEFAULT 0,
  `can_write` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_module_permission` (`role_id`,`module_id`,`permission_type_id`),
  KEY `module_id` (`module_id`),
  KEY `permission_type_id` (`permission_type_id`),
  KEY `idx_role_permissions` (`role_id`,`module_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `system_modules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_3` FOREIGN KEY (`permission_type_id`) REFERENCES `permission_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `organizational_level_id` varchar(36) NOT NULL,
  `department_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `department_id` (`department_id`),
  KEY `idx_role_name` (`name`),
  KEY `idx_org_level` (`organizational_level_id`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`organizational_level_id`) REFERENCES `organizational_levels` (`id`),
  CONSTRAINT `roles_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `safe_mappings`
--

DROP TABLE IF EXISTS `safe_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `safe_mappings` (
  `id` int(11) NOT NULL DEFAULT 0,
  `work_item_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `safe_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stories`
--

DROP TABLE IF EXISTS `stories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stories` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `epic_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `user_story` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `acceptance_criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `priority` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'medium',
  `status` enum('backlog','planning','in_progress','done','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'backlog',
  `assigned_to` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `story_points` int(11) DEFAULT NULL,
  `workflow_stage` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_modules`
--

DROP TABLE IF EXISTS `system_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_modules` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `route_path` varchar(200) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `module_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_module_name` (`name`),
  KEY `idx_module_order` (`module_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `test_cases`
--

DROP TABLE IF EXISTS `test_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_cases` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `work_item_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `work_item_type` enum('feature','epic','story') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `test_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `steps` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `expected_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `status` enum('pass','fail','not_run') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT 'not_run',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!50001 DROP VIEW IF EXISTS `user_permissions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `user_permissions` AS SELECT
 1 AS `user_id`,
  1 AS `user_name`,
  1 AS `email`,
  1 AS `role_name`,
  1 AS `role_display_name`,
  1 AS `module_name`,
  1 AS `module_display_name`,
  1 AS `route_path`,
  1 AS `can_access`,
  1 AS `can_read`,
  1 AS `can_write`,
  1 AS `can_delete`,
  1 AS `can_admin` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `user_role_assignments`
--

DROP TABLE IF EXISTS `user_role_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role_assignments` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role_id` varchar(36) NOT NULL,
  `assigned_by` varchar(36) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_user_roles` (`user_id`),
  KEY `idx_role_users` (`role_id`),
  CONSTRAINT `user_role_assignments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_assignments_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_role_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `login_time` timestamp NULL DEFAULT current_timestamp(),
  `last_activity` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `logout_time` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `entra_id` varchar(36) NOT NULL,
  `user_principal_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `given_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `office_location` varchar(100) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `business_phones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`business_phones`)),
  `manager_email` varchar(255) DEFAULT NULL,
  `direct_reports` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`direct_reports`)),
  `roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`roles`)),
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_count` int(11) DEFAULT 0,
  `created_datetime` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `department_id` varchar(36) DEFAULT NULL,
  `primary_role_id` varchar(36) DEFAULT NULL,
  `organizational_level_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `entra_id` (`entra_id`),
  UNIQUE KEY `user_principal_name` (`user_principal_name`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_entra_id` (`entra_id`),
  KEY `idx_email` (`email`),
  KEY `idx_employee_id` (`employee_id`),
  KEY `idx_department` (`department`),
  KEY `idx_is_active` (`is_active`),
  KEY `department_id` (`department_id`),
  KEY `primary_role_id` (`primary_role_id`),
  KEY `organizational_level_id` (`organizational_level_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`primary_role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`organizational_level_id`) REFERENCES `organizational_levels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_4` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_5` FOREIGN KEY (`primary_role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_6` FOREIGN KEY (`organizational_level_id`) REFERENCES `organizational_levels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vector_stores`
--

DROP TABLE IF EXISTS `vector_stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `vector_stores` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `database_name` varchar(255) NOT NULL,
  `embedding_provider` varchar(50) DEFAULT NULL,
  `embedding_model` varchar(100) DEFAULT NULL,
  `embedding_dimension` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `document_count` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_database_name` (`database_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `work_items_context`
--

DROP TABLE IF EXISTS `work_items_context`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_items_context` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document` text NOT NULL,
  `embedding` vector(1536) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '{}' CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'aura_playground'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetDashboardStats` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM business_briefs WHERE status = 'approved') as approved_briefs,
        (SELECT COUNT(*) FROM initiatives WHERE status IN ('planning', 'in_progress')) as active_initiatives,
        (SELECT COUNT(*) FROM features WHERE status IN ('planning', 'in_progress')) as active_features,
        (SELECT COUNT(*) FROM stories WHERE status IN ('planning', 'in_progress')) as active_stories,
        (SELECT COUNT(*) FROM test_cases WHERE status IN ('ready', 'executing')) as pending_tests,
        (SELECT COUNT(*) FROM test_cases WHERE status = 'passed') as passed_tests,
        (SELECT COUNT(*) FROM test_cases WHERE status = 'failed') as failed_tests,
        (SELECT COUNT(*) FROM documents WHERE processed = true) as processed_documents;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTestCasesWithContext` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetTestCasesWithContext`(
    IN story_id_param VARCHAR(36)
)
BEGIN
    SELECT 
        tc.*,
        s.title as story_title,
        e.title as epic_title,
        f.title as feature_title,
        i.title as initiative_title,
        bb.title as business_brief_title
    FROM test_cases tc
    JOIN stories s ON tc.story_id = s.id
    JOIN epics e ON s.epic_id = e.id
    JOIN features f ON e.feature_id = f.id
    JOIN initiatives i ON f.initiative_id = i.id
    JOIN business_briefs bb ON i.business_brief_id = bb.id
    WHERE tc.story_id = story_id_param OR story_id_param IS NULL
    ORDER BY tc.created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetWorkItemHierarchy` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetWorkItemHierarchy`(
    IN work_item_id VARCHAR(36),
    IN work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story')
)
BEGIN
    CASE work_item_type
        WHEN 'business_brief' THEN
            SELECT 
                bb.id as business_brief_id, bb.title as business_brief_title,
                i.id as initiative_id, i.title as initiative_title,
                f.id as feature_id, f.title as feature_title,
                e.id as epic_id, e.title as epic_title,
                s.id as story_id, s.title as story_title
            FROM business_briefs bb
            LEFT JOIN initiatives i ON bb.id = i.business_brief_id
            LEFT JOIN features f ON i.id = f.initiative_id
            LEFT JOIN epics e ON f.id = e.feature_id
            LEFT JOIN stories s ON e.id = s.epic_id
            WHERE bb.id = work_item_id;
            
        WHEN 'story' THEN
            SELECT 
                bb.id as business_brief_id, bb.title as business_brief_title,
                i.id as initiative_id, i.title as initiative_title,
                f.id as feature_id, f.title as feature_title,
                e.id as epic_id, e.title as epic_title,
                s.id as story_id, s.title as story_title
            FROM stories s
            JOIN epics e ON s.epic_id = e.id
            JOIN features f ON e.feature_id = f.id
            JOIN initiatives i ON f.initiative_id = i.id
            JOIN business_briefs bb ON i.business_brief_id = bb.id
            WHERE s.id = work_item_id;
            
        
        ELSE
            SELECT 'Invalid work item type' as error;
    END CASE;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetWorkItemsByStatus` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `GetWorkItemsByStatus`(
    IN item_status VARCHAR(50)
)
BEGIN
    SELECT 'business_brief' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM business_briefs WHERE status = item_status
    
    UNION ALL
    
    SELECT 'initiative' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM initiatives WHERE status = item_status
    
    UNION ALL
    
    SELECT 'feature' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM features WHERE status = item_status
    
    UNION ALL
    
    SELECT 'epic' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM epics WHERE status = item_status
    
    UNION ALL
    
    SELECT 'story' as type, id, title, status, priority, completion_percentage, created_at, updated_at
    FROM stories WHERE status = item_status
    
    ORDER BY updated_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `SearchWorkItems` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `SearchWorkItems`(
    IN search_text VARCHAR(255)
)
BEGIN
    SELECT 'business_brief' as type, id, title, description, status, priority, created_at
    FROM business_briefs 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'initiative' as type, id, title, description, status, priority, created_at
    FROM initiatives 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'feature' as type, id, title, description, status, priority, created_at
    FROM features 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'epic' as type, id, title, description, status, priority, created_at
    FROM epics 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    UNION ALL
    
    SELECT 'story' as type, id, title, description, status, priority, created_at
    FROM stories 
    WHERE title LIKE CONCAT('%', search_text, '%') OR description LIKE CONCAT('%', search_text, '%')
    
    ORDER BY created_at DESC
    LIMIT 50;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateWorkItemProgress` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`aura_user`@`localhost` PROCEDURE `UpdateWorkItemProgress`(
    IN work_item_id VARCHAR(36),
    IN work_item_type ENUM('business_brief', 'initiative', 'feature', 'epic', 'story'),
    IN new_status VARCHAR(50),
    IN completion_percentage DECIMAL(5,2)
)
BEGIN
    CASE work_item_type
        WHEN 'business_brief' THEN
            UPDATE business_briefs 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'initiative' THEN
            UPDATE initiatives 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'feature' THEN
            UPDATE features 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'epic' THEN
            UPDATE epics 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
            
        WHEN 'story' THEN
            UPDATE stories 
            SET status = new_status, completion_percentage = completion_percentage, updated_at = NOW()
            WHERE id = work_item_id;
    END CASE;
    
    SELECT ROW_COUNT() as affected_rows;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `role_permission_matrix`
--

/*!50001 DROP VIEW IF EXISTS `role_permission_matrix`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`aura_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `role_permission_matrix` AS select `r`.`id` AS `role_id`,`r`.`name` AS `role_name`,`r`.`display_name` AS `role_display_name`,`ol`.`name` AS `organizational_level`,`d`.`name` AS `department`,`sm`.`name` AS `module_name`,`sm`.`display_name` AS `module_display_name`,`rp`.`can_access` AS `can_access`,`rp`.`can_read` AS `can_read`,`rp`.`can_write` AS `can_write`,`rp`.`can_delete` AS `can_delete`,`rp`.`can_admin` AS `can_admin` from ((((`roles` `r` left join `organizational_levels` `ol` on(`r`.`organizational_level_id` = `ol`.`id`)) left join `departments` `d` on(`r`.`department_id` = `d`.`id`)) left join `role_permissions` `rp` on(`r`.`id` = `rp`.`role_id`)) left join `system_modules` `sm` on(`rp`.`module_id` = `sm`.`id`)) order by `ol`.`hierarchy_order`,`r`.`display_name`,`sm`.`module_order` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_permissions`
--

/*!50001 DROP VIEW IF EXISTS `user_permissions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`aura_user`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_permissions` AS select `u`.`id` AS `user_id`,`u`.`display_name` AS `user_name`,`u`.`email` AS `email`,`r`.`name` AS `role_name`,`r`.`display_name` AS `role_display_name`,`sm`.`name` AS `module_name`,`sm`.`display_name` AS `module_display_name`,`sm`.`route_path` AS `route_path`,`rp`.`can_access` AS `can_access`,`rp`.`can_read` AS `can_read`,`rp`.`can_write` AS `can_write`,`rp`.`can_delete` AS `can_delete`,`rp`.`can_admin` AS `can_admin` from ((((`users` `u` join `user_role_assignments` `ura` on(`u`.`id` = `ura`.`user_id` and `ura`.`is_active` = 1)) join `roles` `r` on(`ura`.`role_id` = `r`.`id`)) join `role_permissions` `rp` on(`r`.`id` = `rp`.`role_id`)) join `system_modules` `sm` on(`rp`.`module_id` = `sm`.`id`)) where `u`.`is_active` = 1 and `r`.`is_active` = 1 and `sm`.`is_active` = 1 order by `u`.`display_name`,`sm`.`module_order` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-09-22 20:53:18
