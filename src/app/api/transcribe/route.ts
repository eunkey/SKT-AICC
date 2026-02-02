import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const speaker = formData.get('speaker') as string || 'unknown';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // OpenAI API로 음성을 텍스트로 변환
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'gpt-4o-transcribe',
      language: 'ko',
      response_format: 'json',
      prompt: '이 대화는 SK텔레콤 고객센터 상담 내용입니다. 고객과 상담사가 대화하고 있습니다. 요금제, 데이터, 로밍, T멤버십, 5G, LTE, 휴대폰, 인터넷, TV 등 통신 관련 용어가 포함될 수 있습니다.',
    });

    return NextResponse.json({
      text: transcription.text,
      speaker,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Transcription error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
