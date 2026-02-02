'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff } from 'lucide-react';

export default function SpeechTestPage() {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      addLog('❌ Web Speech API NOT supported in this browser');
      return;
    }

    addLog('✅ Web Speech API supported');

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    addLog(`📋 Config: lang=ko-KR, continuous=true, interimResults=true`);

    recognition.onstart = () => {
      addLog('🎤 Recognition STARTED');
      setIsListening(true);
    };

    recognition.onend = () => {
      addLog('🛑 Recognition ENDED');
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      addLog(`❌ ERROR: ${event.error}`);
    };

    recognition.onspeechstart = () => {
      addLog('🗣️ Speech STARTED');
    };

    recognition.onspeechend = () => {
      addLog('🤐 Speech ENDED');
    };

    recognition.onresult = (event: any) => {
      addLog(`📝 Result event (${event.results.length} results)`);

      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        const confidence = event.results[i][0].confidence;

        if (isFinal) {
          addLog(`✅ FINAL [${i}]: "${transcript}" (confidence: ${confidence})`);
          final += transcript;
        } else {
          addLog(`⏳ INTERIM [${i}]: "${transcript}"`);
          interim += transcript;
        }
      }

      if (interim) {
        setInterimText(interim);
      }

      if (final) {
        setFinalText((prev) => prev + final + ' ');
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // ignore
        }
      }
    };
  }, []);

  const handleStart = () => {
    if (!recognitionRef.current) return;
    try {
      setFinalText('');
      setInterimText('');
      setLogs([]);
      recognitionRef.current.start();
      addLog('▶️ START button clicked');
    } catch (err: any) {
      addLog(`❌ Start failed: ${err.message}`);
    }
  };

  const handleStop = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      addLog('⏹️ STOP button clicked');
    } catch (err: any) {
      addLog(`❌ Stop failed: ${err.message}`);
    }
  };

  if (!isSupported) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">
              ❌ Web Speech API Not Supported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please use Chrome or Edge browser.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Web Speech API Test (Korean)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleStart}
              disabled={isListening}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Start Listening
            </Button>
            <Button
              onClick={handleStop}
              disabled={!isListening}
              variant="destructive"
              className="gap-2"
            >
              <MicOff className="w-4 h-4" />
              Stop Listening
            </Button>
            {isListening && (
              <Badge className="ml-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                Listening...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-600">
              ⏳ Interim (실시간)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[100px] p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 italic">
                {interimText || '(interim results will appear here)'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Final (확정)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[100px] p-4 bg-green-50 rounded-lg">
              <p className="text-green-900">
                {finalText || '(final results will appear here)'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📋 Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">No events yet...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
