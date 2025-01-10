-- CreateEnum
CREATE TYPE "esign_status" AS ENUM ('rejected', 'approved', 'pending', 'null');

-- CreateEnum
CREATE TYPE "PrinterLineConfigure" AS ENUM ('enable', 'disable');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'user');

-- CreateEnum
CREATE TYPE "RoundingFactor" AS ENUM ('roundup', 'rounddown', 'round');

-- CreateEnum
CREATE TYPE "PrintingTechnology" AS ENUM ('inkBased', 'ribbonBased');

-- CreateEnum
CREATE TYPE "Protocol" AS ENUM ('TCP', 'UDP');

-- CreateEnum
CREATE TYPE "Caution_logo" AS ENUM ('red', 'blue', 'yellow', 'green');

-- CreateEnum
CREATE TYPE "Packaging_hierarchy" AS ENUM ('one_layer', 'two_layer', 'three_layer', 'four_layer');

-- CreateEnum
CREATE TYPE "CodeGenerationRequestStatus" AS ENUM ('requested', 'inprogress', 'completed');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'complete');

-- CreateTable
CREATE TABLE "ApiRegistry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "api_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "endpoint" VARCHAR(255) NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreenRegistry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "screen_id" SERIAL NOT NULL,
    "screen_name" VARCHAR(50) NOT NULL,
    "screen_url" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreenRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiScreenRegistry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "api_id" UUID NOT NULL,
    "screen_id" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiScreenRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" VARCHAR(50) NOT NULL,
    "user_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL DEFAULT '',
    "phone_number" VARCHAR(20) NOT NULL DEFAULT '',
    "password" VARCHAR(255) NOT NULL,
    "location_id" UUID,
    "department_id" UUID,
    "designation_id" UUID,
    "profile_photo" VARCHAR(255),
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'user',
    "jwt_token" VARCHAR(1024),
    "last_activity_at" TIMESTAMPTZ(6),
    "password_expires_on" TIMESTAMPTZ(6) NOT NULL DEFAULT (now() + '90 days'::interval),
    "old_passwords" VARCHAR(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "failed_login_attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_failed_login_at" TIMESTAMPTZ(6),
    "account_locked_until_at" TIMESTAMPTZ(6),
    "accessibility" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_uuid" UUID NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "user_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL DEFAULT '',
    "phone_number" VARCHAR(20) NOT NULL DEFAULT '',
    "department_id" UUID,
    "designation_id" UUID,
    "location_id" UUID,
    "profile_photo" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "accessibility" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" VARCHAR(20) NOT NULL,
    "company_name" VARCHAR(50) NOT NULL,
    "mfg_licence_no" VARCHAR(125) NOT NULL,
    "email" VARCHAR(125) NOT NULL DEFAULT '',
    "contact" VARCHAR(10) NOT NULL DEFAULT '',
    "address" VARCHAR(150) NOT NULL DEFAULT '',
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_uuid" UUID NOT NULL,
    "company_id" VARCHAR(20) NOT NULL,
    "company_name" VARCHAR(50) NOT NULL,
    "mfg_licence_no" VARCHAR(125) NOT NULL,
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,
    "email" VARCHAR(125) NOT NULL DEFAULT '',
    "contact" VARCHAR(10) NOT NULL DEFAULT '',
    "address" VARCHAR(150) NOT NULL DEFAULT '',
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CompanyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "performed_action" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_id" TEXT,
    "performed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "department_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "is_location_required" BOOLEAN NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "department_uuid" UUID NOT NULL,
    "department_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "is_location_required" BOOLEAN NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "department_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "designation_id" TEXT NOT NULL,
    "designation_name" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "api_ids" INTEGER[],
    "screen_ids" INTEGER[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designation_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "designation_uuid" UUID NOT NULL,
    "designation_id" TEXT NOT NULL,
    "designation_name" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "designation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "superadmin_configuration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "esign_status" BOOLEAN NOT NULL DEFAULT false,
    "audit_logs" BOOLEAN NOT NULL DEFAULT false,
    "codes_generated" BOOLEAN NOT NULL DEFAULT false,
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,
    "codes_type" TEXT,
    "code_length" INTEGER,
    "product_code_length" INTEGER,
    "crm_url" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "superadmin_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodesGenerated" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "location_id" TEXT NOT NULL,
    "location_name" TEXT NOT NULL,
    "mfg_licence_no" TEXT NOT NULL,
    "mfg_name" TEXT,
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "esign_status" "esign_status" NOT NULL DEFAULT 'approved',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "location_uuid" UUID NOT NULL,
    "location_id" TEXT NOT NULL,
    "location_name" TEXT NOT NULL,
    "mfg_licence_no" TEXT NOT NULL,
    "mfg_name" TEXT,
    "address" TEXT,
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uom" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "uom_name" TEXT NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uom_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "uom_name" TEXT NOT NULL,
    "uom_uuid" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "uom_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_category_name" VARCHAR(100) NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "InstrumentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentCategoryParameter" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parameter_name" VARCHAR(100) NOT NULL,
    "decimal_place" INTEGER NOT NULL,
    "rounding_factor" "RoundingFactor" NOT NULL DEFAULT 'round',
    "uom_parameter_id" UUID NOT NULL,
    "instrument_category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "InstrumentCategoryParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_id" VARCHAR(50) NOT NULL,
    "instrument_name" VARCHAR(100) NOT NULL,
    "instrument_category_id" UUID NOT NULL,
    "area_category_id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "protocol" "Protocol" NOT NULL,
    "ip" VARCHAR(15),
    "port" INTEGER,
    "manual_method" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_uuid" UUID NOT NULL,
    "instrument_id" VARCHAR(50) NOT NULL,
    "instrument_name" VARCHAR(100) NOT NULL,
    "instrument_category_id" UUID NOT NULL,
    "area_category_id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "protocol" "Protocol" NOT NULL,
    "ip" VARCHAR(15),
    "port" INTEGER,
    "manual_method" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InstrumentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area_id" TEXT NOT NULL,
    "area_name" TEXT NOT NULL,
    "area_category_id" UUID NOT NULL,
    "location_uuid" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area_id" TEXT NOT NULL,
    "area_name" TEXT NOT NULL,
    "area_category_id" UUID NOT NULL,
    "location_uuid" UUID NOT NULL,
    "area_uuid" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "area_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area_category_name" TEXT NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "area_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areacategory_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "area_category_name" TEXT NOT NULL,
    "areacategory_uuid" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "areacategory_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentCategoryHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrument_category_id" UUID NOT NULL,
    "instrument_category_name" TEXT NOT NULL,
    "esign_status" "esign_status" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "change_type" VARCHAR(20) NOT NULL,

    CONSTRAINT "InstrumentCategoryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentCategoryParameterHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instrumentcategory_parameter_uuid" UUID NOT NULL,
    "parameter_name" VARCHAR(100) NOT NULL,
    "decimal_place" INTEGER NOT NULL,
    "rounding_factor" "RoundingFactor" NOT NULL DEFAULT 'round',
    "uom_parameter_id" UUID NOT NULL,
    "instrument_category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_type" VARCHAR(20) NOT NULL,
    "instrumentcategory_history_uuid" UUID NOT NULL,

    CONSTRAINT "InstrumentCategoryParameterHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "country_id" UUID NOT NULL,
    "ndc" TEXT DEFAULT '',
    "mrp" DOUBLE PRECISION DEFAULT 0.0,
    "generic_name" TEXT NOT NULL DEFAULT '',
    "packaging_size" VARCHAR(10) NOT NULL,
    "firstLayer" INTEGER,
    "secondLayer" INTEGER,
    "thirdLayer" INTEGER,
    "productNumber" INTEGER,
    "packagingHierarchy" INTEGER NOT NULL,
    "company_uuid" UUID NOT NULL,
    "antidote_statement" VARCHAR(255) NOT NULL,
    "caution_logo" "Caution_logo" NOT NULL DEFAULT 'green',
    "label" TEXT NOT NULL DEFAULT '',
    "leaflet" TEXT NOT NULL DEFAULT '',
    "registration_no" VARCHAR(50) NOT NULL,
    "product_image" TEXT NOT NULL DEFAULT '',
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "ndc" TEXT DEFAULT '',
    "mrp" DOUBLE PRECISION DEFAULT 0.0,
    "generic_name" TEXT NOT NULL DEFAULT '',
    "packagingHierarchy" INTEGER NOT NULL,
    "packaging_size" VARCHAR(10) NOT NULL,
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,
    "productNumber" INTEGER,
    "firstLayer" INTEGER,
    "secondLayer" INTEGER,
    "thirdLayer" INTEGER,
    "company_uuid" UUID NOT NULL,
    "antidote_statement" VARCHAR(255) NOT NULL,
    "caution_logo" "Caution_logo" NOT NULL DEFAULT 'green',
    "label" TEXT NOT NULL DEFAULT '',
    "leaflet" TEXT NOT NULL DEFAULT '',
    "registration_no" VARCHAR(50) NOT NULL,
    "product_image" TEXT NOT NULL DEFAULT '',
    "product_uuid" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "country_id" UUID NOT NULL,

    CONSTRAINT "product_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batch_no" TEXT NOT NULL,
    "product_uuid" UUID NOT NULL,
    "producthistory_uuid" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "manufacturing_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batch_no" TEXT NOT NULL,
    "product_uuid" UUID NOT NULL,
    "producthistory_uuid" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL,
    "batch_uuid" UUID NOT NULL,
    "esign_status" "esign_status" NOT NULL DEFAULT 'null',
    "manufacturing_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "batchSignatureLogId" UUID,

    CONSTRAINT "batch_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_id" VARCHAR(50) NOT NULL,
    "equipment_name" VARCHAR(100) NOT NULL,
    "equipment_category_id" UUID NOT NULL,
    "area_category_id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "esign_status" VARCHAR(20) DEFAULT 'rejected',
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_uuid" UUID NOT NULL,
    "equipment_id" VARCHAR(50) NOT NULL,
    "equipment_name" VARCHAR(100) NOT NULL,
    "equipment_category_id" UUID NOT NULL,
    "area_category_id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "esign_status" VARCHAR(20) DEFAULT 'rejected',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN DEFAULT true,

    CONSTRAINT "equipment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_category_name" VARCHAR(100) NOT NULL,
    "esign_status" VARCHAR(20) DEFAULT 'rejected',
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipmentcategory_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_category_name" VARCHAR(100) NOT NULL,
    "equipmentcategory_uuid" UUID NOT NULL,
    "esign_status" VARCHAR(20) DEFAULT 'rejected',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_latest" BOOLEAN DEFAULT true,

    CONSTRAINT "equipmentcategory_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL,
    "workflow_name" VARCHAR(100) NOT NULL,
    "workflow_edge" JSONB NOT NULL,
    "workflow_node" JSONB NOT NULL,
    "relation" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterCategory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "printer_category_id" VARCHAR(50) NOT NULL,
    "printer_category_name" VARCHAR(50) NOT NULL,
    "printingTechnology" "PrintingTechnology" NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PrinterCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterCategoryHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "printer_category_uuid" UUID NOT NULL,
    "printer_category_id" VARCHAR(50) NOT NULL,
    "printer_category_name" VARCHAR(50) NOT NULL,
    "printingTechnology" "PrintingTechnology" NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrinterCategoryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterMaster" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "printer_category_id" UUID NOT NULL,
    "printer_id" VARCHAR(50) NOT NULL,
    "printer_ip" VARCHAR(50) NOT NULL,
    "printer_port" VARCHAR(50) NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PrinterMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterMasterHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "printermaster_uuid" UUID NOT NULL,
    "printer_category_id" UUID NOT NULL,
    "printer_id" VARCHAR(50) NOT NULL,
    "printer_ip" VARCHAR(50) NOT NULL,
    "printer_port" VARCHAR(50) NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrinterMasterHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterLineConfiguration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "printer_line_name" VARCHAR(50) NOT NULL,
    "location_id" UUID NOT NULL,
    "area_category_id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "printer_category_id" UUID NOT NULL,
    "printer_id" UUID NOT NULL,
    "control_panel_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PrinterLineConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrinterLineConfigurationHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "printerlineconfiguration_uuid" UUID NOT NULL,
    "printer_line_name" VARCHAR(50) NOT NULL,
    "location_id" UUID NOT NULL,
    "area_category_id" UUID NOT NULL,
    "printer_category_id" UUID NOT NULL,
    "printer_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "area_id" UUID NOT NULL,
    "control_panel_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrinterLineConfigurationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductGenerationId" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "generation_id" TEXT NOT NULL,
    "sent_to_cloud" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductGenerationId_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeGenerationSummary" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "generation_id" TEXT NOT NULL,
    "packaging_hierarchy" TEXT NOT NULL,
    "last_generated" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CodeGenerationSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeGenerationRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "generation_id" TEXT NOT NULL,
    "packaging_hierarchy" TEXT NOT NULL,
    "no_of_codes" TEXT NOT NULL,
    "generated_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CodeGenerationRequestStatus" NOT NULL DEFAULT 'requested',
    "batch_quantity" TEXT NOT NULL,

    CONSTRAINT "CodeGenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlPanelMaster" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "ip" VARCHAR(15) NOT NULL,
    "port" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',

    CONSTRAINT "ControlPanelMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlPanelMasterHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "controlpanelmaster_uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "ip" VARCHAR(15) NOT NULL,
    "port" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "esign_status" "esign_status" DEFAULT 'null',
    "is_latest" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ControlPanelMasterHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryMaster" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "country" VARCHAR(100) NOT NULL,
    "codeStructure" TEXT NOT NULL,

    CONSTRAINT "CountryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryMasterHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "country" VARCHAR(100) NOT NULL,
    "country_id" UUID NOT NULL,
    "codeStructure" TEXT NOT NULL,

    CONSTRAINT "CountryMasterHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchSignatureLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "process_id" TEXT,
    "esign_status" "esign_status" DEFAULT 'approved',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BatchSignatureLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aggregation_transaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "aggregation_count" INTEGER NOT NULL DEFAULT 0,
    "product_gen_id" TEXT NOT NULL,
    "packagingHierarchy" INTEGER NOT NULL,
    "producthistory_uuid" UUID NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Aggregation_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scanned_code" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_id" UUID NOT NULL,
    "scanned_0_codes" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "scanned_1_codes" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "scanned_2_codes" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "scanned_3_codes" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "scanned_5_codes" JSONB[] DEFAULT ARRAY[]::JSONB[],

    CONSTRAINT "Scanned_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiRegistry_name_endpoint_method_path_key" ON "ApiRegistry"("name", "endpoint", "method", "path");

-- CreateIndex
CREATE UNIQUE INDEX "ScreenRegistry_screen_name_key" ON "ScreenRegistry"("screen_name");

-- CreateIndex
CREATE UNIQUE INDEX "ScreenRegistry_screen_url_key" ON "ScreenRegistry"("screen_url");

-- CreateIndex
CREATE UNIQUE INDEX "ScreenRegistry_screen_name_screen_url_key" ON "ScreenRegistry"("screen_name", "screen_url");

-- CreateIndex
CREATE UNIQUE INDEX "ApiScreenRegistry_api_id_screen_id_key" ON "ApiScreenRegistry"("api_id", "screen_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_company_id_key" ON "Company"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_company_name_key" ON "Company"("company_name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_mfg_licence_no_key" ON "Company"("mfg_licence_no");

-- CreateIndex
CREATE UNIQUE INDEX "departments_department_id_key" ON "departments"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_department_name_key" ON "departments"("department_name");

-- CreateIndex
CREATE UNIQUE INDEX "designations_designation_id_key" ON "designations"("designation_id");

-- CreateIndex
CREATE UNIQUE INDEX "designations_designation_name_department_id_key" ON "designations"("designation_name", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "CodesGenerated_id_key" ON "CodesGenerated"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CodesGenerated_code_key" ON "CodesGenerated"("code");

-- CreateIndex
CREATE UNIQUE INDEX "locations_location_id_key" ON "locations"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_location_name_key" ON "locations"("location_name");

-- CreateIndex
CREATE UNIQUE INDEX "locations_mfg_licence_no_key" ON "locations"("mfg_licence_no");

-- CreateIndex
CREATE UNIQUE INDEX "uom_uom_name_key" ON "uom"("uom_name");

-- CreateIndex
CREATE UNIQUE INDEX "InstrumentCategory_instrument_category_name_key" ON "InstrumentCategory"("instrument_category_name");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_instrument_id_key" ON "Instrument"("instrument_id");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_instrument_name_key" ON "Instrument"("instrument_name");

-- CreateIndex
CREATE INDEX "instrument_category_idx" ON "Instrument"("instrument_category_id");

-- CreateIndex
CREATE INDEX "area_category_idx" ON "Instrument"("area_category_id");

-- CreateIndex
CREATE INDEX "area_idx" ON "Instrument"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "area_area_id_key" ON "area"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "area_area_name_key" ON "area"("area_name");

-- CreateIndex
CREATE UNIQUE INDEX "area_category_area_category_name_key" ON "area_category"("area_category_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_product_id_key" ON "product"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_product_name_key" ON "product"("product_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_gtin_key" ON "product"("gtin");

-- CreateIndex
CREATE UNIQUE INDEX "product_product_id_ndc_gtin_key" ON "product"("product_id", "ndc", "gtin");

-- CreateIndex
CREATE UNIQUE INDEX "product_history_packagingHierarchy_key" ON "product_history"("packagingHierarchy");

-- CreateIndex
CREATE UNIQUE INDEX "product_history_product_uuid_key" ON "product_history"("product_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "batch_batch_no_key" ON "batch"("batch_no");

-- CreateIndex
CREATE UNIQUE INDEX "batch_producthistory_uuid_key" ON "batch"("producthistory_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "batch_batch_no_producthistory_uuid_location_id_key" ON "batch"("batch_no", "producthistory_uuid", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_equipment_id_key" ON "equipment"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_equipment_name_key" ON "equipment"("equipment_name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_category_equipment_category_name_key" ON "equipment_category"("equipment_category_name");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterCategory_printer_category_id_key" ON "PrinterCategory"("printer_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterMaster_printer_id_key" ON "PrinterMaster"("printer_id");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterMaster_printer_ip_key" ON "PrinterMaster"("printer_ip");

-- CreateIndex
CREATE UNIQUE INDEX "PrinterLineConfiguration_printer_line_name_key" ON "PrinterLineConfiguration"("printer_line_name");

-- CreateIndex
CREATE UNIQUE INDEX "ControlPanelMaster_name_key" ON "ControlPanelMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ControlPanelMaster_ip_key" ON "ControlPanelMaster"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "CountryMaster_country_key" ON "CountryMaster"("country");

-- AddForeignKey
ALTER TABLE "ApiScreenRegistry" ADD CONSTRAINT "ApiScreenRegistry_api_id_fkey" FOREIGN KEY ("api_id") REFERENCES "ApiRegistry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiScreenRegistry" ADD CONSTRAINT "ApiScreenRegistry_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "ScreenRegistry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_history" ADD CONSTRAINT "user_history_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_history" ADD CONSTRAINT "user_history_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_history" ADD CONSTRAINT "user_history_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_history" ADD CONSTRAINT "user_history_users_fk" FOREIGN KEY ("user_uuid") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyHistory" ADD CONSTRAINT "companyhistory_company_fk" FOREIGN KEY ("company_uuid") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_history" ADD CONSTRAINT "department_history_department_uuid_fkey" FOREIGN KEY ("department_uuid") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designation_history" ADD CONSTRAINT "designation_history_departments_fk" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designation_history" ADD CONSTRAINT "designation_history_designation_uuid_fkey" FOREIGN KEY ("designation_uuid") REFERENCES "designations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_history" ADD CONSTRAINT "location_history_location_uuid_fkey" FOREIGN KEY ("location_uuid") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom_history" ADD CONSTRAINT "uom_history_uom_uuid_fkey" FOREIGN KEY ("uom_uuid") REFERENCES "uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategoryParameter" ADD CONSTRAINT "InstrumentCategoryParameter_uom_parameter_id_fkey" FOREIGN KEY ("uom_parameter_id") REFERENCES "uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategoryParameter" ADD CONSTRAINT "instrumentcategoryparameter_instrumentcategory_fk" FOREIGN KEY ("instrument_category_id") REFERENCES "InstrumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_instrument_category_id_fkey" FOREIGN KEY ("instrument_category_id") REFERENCES "InstrumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentHistory" ADD CONSTRAINT "InstrumentHistory_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentHistory" ADD CONSTRAINT "InstrumentHistory_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentHistory" ADD CONSTRAINT "InstrumentHistory_instrument_category_id_fkey" FOREIGN KEY ("instrument_category_id") REFERENCES "InstrumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentHistory" ADD CONSTRAINT "instrumenthistory_instrument_fk" FOREIGN KEY ("instrument_uuid") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_location_uuid_fkey" FOREIGN KEY ("location_uuid") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_history" ADD CONSTRAINT "area_history_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_history" ADD CONSTRAINT "area_history_area_uuid_fkey" FOREIGN KEY ("area_uuid") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_history" ADD CONSTRAINT "area_history_location_uuid_fkey" FOREIGN KEY ("location_uuid") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areacategory_history" ADD CONSTRAINT "areacategory_history_areacategory_uuid_fkey" FOREIGN KEY ("areacategory_uuid") REFERENCES "area_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategoryHistory" ADD CONSTRAINT "instrumentcategoryhistory_instrumentcategory_fk" FOREIGN KEY ("instrument_category_id") REFERENCES "InstrumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategoryParameterHistory" ADD CONSTRAINT "instrumentcategoryparameterhistory_ic_history_fk" FOREIGN KEY ("instrumentcategory_history_uuid") REFERENCES "InstrumentCategoryHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategoryParameterHistory" ADD CONSTRAINT "instrumentcategoryparameterhistory_instrumentcategory_fk" FOREIGN KEY ("instrument_category_id") REFERENCES "InstrumentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategoryParameterHistory" ADD CONSTRAINT "instrumentcategoryparameterhistory_instrumentcategoryparameter_" FOREIGN KEY ("instrumentcategory_parameter_uuid") REFERENCES "InstrumentCategoryParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentCategoryParameterHistory" ADD CONSTRAINT "instrumentcategoryparameterhistory_uom_fk" FOREIGN KEY ("uom_parameter_id") REFERENCES "uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "CountryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "CountryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_producthistory_uuid_fkey" FOREIGN KEY ("producthistory_uuid") REFERENCES "product_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_history" ADD CONSTRAINT "batch_history_batch_uuid_fkey" FOREIGN KEY ("batch_uuid") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_history" ADD CONSTRAINT "batch_history_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_history" ADD CONSTRAINT "batch_history_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_history" ADD CONSTRAINT "batch_history_producthistory_uuid_fkey" FOREIGN KEY ("producthistory_uuid") REFERENCES "product_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_history" ADD CONSTRAINT "batch_history_batchSignatureLogId_fkey" FOREIGN KEY ("batchSignatureLogId") REFERENCES "BatchSignatureLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_equipment_category_id_fkey" FOREIGN KEY ("equipment_category_id") REFERENCES "equipment_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_equipment_category_id_fkey" FOREIGN KEY ("equipment_category_id") REFERENCES "equipment_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipment_history" ADD CONSTRAINT "equipment_history_equipment_uuid_fkey" FOREIGN KEY ("equipment_uuid") REFERENCES "equipment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "equipmentcategory_history" ADD CONSTRAINT "equipmentcategory_history_equipmentcategory_uuid_fkey" FOREIGN KEY ("equipmentcategory_uuid") REFERENCES "equipment_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PrinterCategoryHistory" ADD CONSTRAINT "PrinterCategoryHistory_printer_category_uuid_fkey" FOREIGN KEY ("printer_category_uuid") REFERENCES "PrinterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterMaster" ADD CONSTRAINT "PrinterMaster_printer_category_id_fkey" FOREIGN KEY ("printer_category_id") REFERENCES "PrinterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterMasterHistory" ADD CONSTRAINT "PrinterMasterHistory_printermaster_uuid_fkey" FOREIGN KEY ("printermaster_uuid") REFERENCES "PrinterMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterMasterHistory" ADD CONSTRAINT "PrinterMasterHistory_printer_category_id_fkey" FOREIGN KEY ("printer_category_id") REFERENCES "PrinterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfiguration" ADD CONSTRAINT "PrinterLineConfiguration_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfiguration" ADD CONSTRAINT "PrinterLineConfiguration_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfiguration" ADD CONSTRAINT "PrinterLineConfiguration_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfiguration" ADD CONSTRAINT "PrinterLineConfiguration_printer_category_id_fkey" FOREIGN KEY ("printer_category_id") REFERENCES "PrinterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfiguration" ADD CONSTRAINT "PrinterLineConfiguration_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "PrinterMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfiguration" ADD CONSTRAINT "PrinterLineConfiguration_control_panel_id_fkey" FOREIGN KEY ("control_panel_id") REFERENCES "ControlPanelMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfigurationHistory" ADD CONSTRAINT "PrinterLineConfigurationHistory_control_panel_id_fkey" FOREIGN KEY ("control_panel_id") REFERENCES "ControlPanelMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfigurationHistory" ADD CONSTRAINT "PrinterLineConfigurationHistory_printerlineconfiguration_u_fkey" FOREIGN KEY ("printerlineconfiguration_uuid") REFERENCES "PrinterLineConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfigurationHistory" ADD CONSTRAINT "PrinterLineConfigurationHistory_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfigurationHistory" ADD CONSTRAINT "PrinterLineConfigurationHistory_area_category_id_fkey" FOREIGN KEY ("area_category_id") REFERENCES "area_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfigurationHistory" ADD CONSTRAINT "PrinterLineConfigurationHistory_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfigurationHistory" ADD CONSTRAINT "PrinterLineConfigurationHistory_printer_category_id_fkey" FOREIGN KEY ("printer_category_id") REFERENCES "PrinterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrinterLineConfigurationHistory" ADD CONSTRAINT "PrinterLineConfigurationHistory_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "PrinterMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductGenerationId" ADD CONSTRAINT "ProductGenerationId_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeGenerationSummary" ADD CONSTRAINT "CodeGenerationSummary_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeGenerationRequest" ADD CONSTRAINT "CodeGenerationRequest_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeGenerationRequest" ADD CONSTRAINT "CodeGenerationRequest_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeGenerationRequest" ADD CONSTRAINT "CodeGenerationRequest_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlPanelMasterHistory" ADD CONSTRAINT "ControlPanelMasterHistory_controlpanelmaster_uuid_fkey" FOREIGN KEY ("controlpanelmaster_uuid") REFERENCES "ControlPanelMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryMasterHistory" ADD CONSTRAINT "CountryMasterHistory_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "CountryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSignatureLog" ADD CONSTRAINT "BatchSignatureLog_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSignatureLog" ADD CONSTRAINT "BatchSignatureLog_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchSignatureLog" ADD CONSTRAINT "BatchSignatureLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aggregation_transaction" ADD CONSTRAINT "Aggregation_transaction_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aggregation_transaction" ADD CONSTRAINT "Aggregation_transaction_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aggregation_transaction" ADD CONSTRAINT "Aggregation_transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aggregation_transaction" ADD CONSTRAINT "Aggregation_transaction_packagingHierarchy_fkey" FOREIGN KEY ("packagingHierarchy") REFERENCES "product_history"("packagingHierarchy") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aggregation_transaction" ADD CONSTRAINT "Aggregation_transaction_producthistory_uuid_fkey" FOREIGN KEY ("producthistory_uuid") REFERENCES "batch"("producthistory_uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scanned_code" ADD CONSTRAINT "Scanned_code_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Aggregation_transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
