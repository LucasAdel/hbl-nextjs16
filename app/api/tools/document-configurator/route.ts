import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateConfiguration,
  validateConfiguration,
  type ConfigurationState,
} from "@/lib/configurator/template-builder";

// In-memory storage for demo purposes
const configurations = new Map<string, {
  timestamp: number;
  configuration: ConfigurationState;
  result: ReturnType<typeof calculateConfiguration>;
  email?: string;
}>();

interface SaveConfigurationRequest {
  configuration: ConfigurationState;
  email?: string;
}

/**
 * POST /api/tools/document-configurator
 * Saves a document configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body: SaveConfigurationRequest = await request.json();
    const { configuration, email } = body;

    // Validate input
    if (!configuration) {
      return NextResponse.json(
        { error: "Configuration is required" },
        { status: 400 }
      );
    }

    // Validate configuration
    const validation = validateConfiguration(configuration);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid configuration", details: validation.errors },
        { status: 400 }
      );
    }

    // Calculate result
    const result = calculateConfiguration(configuration);

    // Get user ID if authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Store configuration
    const configId = `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    configurations.set(configId, {
      timestamp: Date.now(),
      configuration,
      result,
      email,
    });

    // Award XP if authenticated
    if (user) {
      try {
        await fetch(`${request.nextUrl.origin}/api/xp/earn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "complete_quiz",
            metadata: {
              tool: "document_configurator",
              templateId: configuration.templateId,
              optionsCount: Array.from(configuration.selectedOptions.values()).flat().length,
            },
          }),
        });
      } catch (xpError) {
        console.error("Failed to award XP:", xpError);
      }
    }

    return NextResponse.json({
      success: true,
      configId,
      userId: user?.id || null,
      ...result,
    });
  } catch (error) {
    console.error("Error saving configuration:", error);
    return NextResponse.json(
      { error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tools/document-configurator?id=xxx
 * Retrieves a saved configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get("id");

    if (!configId) {
      return NextResponse.json(
        { error: "Configuration ID is required" },
        { status: 400 }
      );
    }

    const stored = configurations.get(configId);
    if (!stored) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Convert Map to object for JSON serialization
    const configWithSerializableOptions = {
      ...stored.configuration,
      selectedOptions: Object.fromEntries(stored.configuration.selectedOptions),
    };

    // Spread result first, then override configuration with serializable version
    const { configuration: _originalConfig, ...resultWithoutConfig } = stored.result;

    return NextResponse.json({
      success: true,
      ...resultWithoutConfig,
      configuration: configWithSerializableOptions,
      savedAt: new Date(stored.timestamp).toISOString(),
    });
  } catch (error) {
    console.error("Error retrieving configuration:", error);
    return NextResponse.json(
      { error: "Failed to retrieve configuration" },
      { status: 500 }
    );
  }
}
