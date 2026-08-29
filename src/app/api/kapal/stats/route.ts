// src/app/api/kapal/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { KapalService } from '@/lib/database';

// GET - Mendapatkan statistik kapal
export async function GET(request: NextRequest) {
  try {
    const stats = await KapalService.getKapalStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching kapal stats:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Gagal mengambil statistik kapal" 
      },
      { status: 500 }
    );
  }
}