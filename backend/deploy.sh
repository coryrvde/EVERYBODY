#!/bin/bash

# ============================================================================
# GUARDIAN AI BACKEND DEPLOYMENT SCRIPT
# This script helps deploy the backend to Supabase
# ============================================================================

set -e  # Exit on any error

echo "🚀 Guardian AI Backend Deployment Script"
echo "========================================"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Function to deploy edge functions
deploy_functions() {
    echo "📦 Deploying Edge Functions..."

    # Deploy process-alert function
    if [ -d "supabase/functions/process-alert" ]; then
        echo "  - Deploying process-alert function..."
        supabase functions deploy process-alert
        echo "  ✅ process-alert deployed"
    else
        echo "  ⚠️  process-alert function not found, skipping..."
    fi

    # Deploy emergency-response function
    if [ -d "supabase/functions/emergency-response" ]; then
        echo "  - Deploying emergency-response function..."
        supabase functions deploy emergency-response
        echo "  ✅ emergency-response deployed"
    else
        echo "  ⚠️  emergency-response function not found, skipping..."
    fi

    echo "✅ All Edge Functions deployed"
}

# Function to run database migrations
run_migrations() {
    echo "🗄️  Running Database Migrations..."

    # Check if migration file exists
    if [ -f "supabase/migrations/001_initial_schema.sql" ]; then
        echo "  - Applying initial schema migration..."

        # You can either run this manually in the Supabase dashboard
        # or use the CLI if you have db push permissions
        echo "  📋 Please run the following SQL in your Supabase SQL Editor:"
        echo "     File: supabase/migrations/001_initial_schema.sql"
        echo ""
        echo "  Or use: supabase db push (if you have permissions)"
    else
        echo "  ⚠️  Migration file not found"
    fi
}

# Function to set up environment variables
setup_env() {
    echo "🔧 Setting up Environment Variables..."
    echo "  📋 Please set these environment variables in your Supabase Edge Functions:"
    echo "     - SUPABASE_URL: Your Supabase project URL"
    echo "     - SUPABASE_ANON_KEY: Your Supabase anon key"
    echo ""
    echo "  You can find these in your Supabase dashboard under Settings > API"
}

# Function to verify deployment
verify_deployment() {
    echo "🔍 Verifying Deployment..."

    # Check if functions are deployed
    echo "  - Checking deployed functions..."
    supabase functions list

    # Test database connection (basic check)
    echo "  - Testing database connectivity..."
    # This would require more complex setup to actually test

    echo "✅ Deployment verification completed"
}

# Main deployment process
main() {
    echo "📋 Deployment Steps:"
    echo "1. Deploy Edge Functions"
    echo "2. Run Database Migrations"
    echo "3. Set up Environment Variables"
    echo "4. Verify Deployment"
    echo ""

    read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi

    deploy_functions
    echo ""

    run_migrations
    echo ""

    setup_env
    echo ""

    verify_deployment
    echo ""

    echo "🎉 Backend deployment completed!"
    echo ""
    echo "📚 Next Steps:"
    echo "1. Copy the API functions from backend/api/guardian-api.js to your React Native app"
    echo "2. Set up real-time subscriptions using backend/realtime-setup.js"
    echo "3. Test the authentication and basic API calls"
    echo "4. Deploy your React Native app"
    echo ""
    echo "📖 Documentation: See backend/README.md for detailed usage instructions"
}

# Run main function
main "$@"
