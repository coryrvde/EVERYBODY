#!/bin/bash

# Guardian AI Database Setup Script
# This script helps set up the Supabase database for the AI monitoring system

echo "🚀 Setting up Guardian AI Database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
fi

# Start Supabase locally (if not already running)
echo "🔄 Starting Supabase local development..."
supabase start

# Apply migrations
echo "📊 Applying database migrations..."
supabase db reset

# Generate TypeScript types
echo "🔧 Generating TypeScript types..."
supabase gen types typescript --local > app/types/supabase.ts

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the local Supabase credentials"
echo "2. The AI monitoring system should now work without database errors"
echo "3. You can view the database at: http://localhost:54323"
echo ""
echo "🔑 Local Supabase credentials:"
supabase status
