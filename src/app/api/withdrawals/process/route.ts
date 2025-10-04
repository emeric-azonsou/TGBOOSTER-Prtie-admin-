import { NextRequest, NextResponse } from "next/server";
import { WithdrawalService } from "@/services/withdrawal.service";
import type { WithdrawalProcessRequest } from "@/types/finance.types";

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawalProcessRequest = await request.json();

    const result = await WithdrawalService.processWithdrawal(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors du traitement du retrait",
      },
      { status: 500 }
    );
  }
}
