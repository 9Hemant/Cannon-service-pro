/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageSquare, 
  Camera, 
  Settings, 
  Wrench, 
  Network, 
  BookOpen, 
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  History,
  Info,
  Mic,
  MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CANON_ERROR_CODES, ErrorCode } from './data/canonErrorCodes';
import { getTroubleshootingAdvice, diagnoseImage } from './services/gemini';
import ReactMarkdown from 'react-markdown';

// --- Sub-components ---

const Dashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors border-2 border-primary/10"
          onClick={() => onNavigate('troubleshoot')}
        >
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold">Error Lookup</span>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors border-2 border-primary/10"
          onClick={() => onNavigate('chat')}
        >
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold">AI Assistant</span>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors border-2 border-primary/10"
          onClick={() => onNavigate('vision')}
        >
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold">Visual Diagnosis</span>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors border-2 border-primary/10"
          onClick={() => onNavigate('network')}
        >
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold">Network/Scan</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-orange-800 dark:text-orange-300">
            <AlertTriangle className="w-4 h-4" />
            Safety Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-orange-700 dark:text-orange-400">
            Always disconnect power before servicing high-voltage components. Use ESD protection when handling PCBs.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Recent Issues</h3>
        <div className="space-y-2">
          {CANON_ERROR_CODES.slice(0, 3).map(err => (
            <div key={err.code} className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm">
              <div className="flex items-center gap-3">
                <Badge variant={err.severity === 'critical' ? 'destructive' : 'secondary'}>{err.code}</Badge>
                <span className="text-sm font-medium truncate max-w-[180px]">{err.title}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Troubleshooting = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ErrorCode[]>([]);
  const [selected, setSelected] = useState<ErrorCode | null>(null);

  useEffect(() => {
    if (search.length > 1) {
      const filtered = CANON_ERROR_CODES.filter(e => 
        e.code.toLowerCase().includes(search.toLowerCase()) || 
        e.title.toLowerCase().includes(search.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [search]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Enter error code or symptom..." 
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        {selected ? (
          <div className="space-y-4 pb-10">
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="mb-2">
              ← Back to results
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={selected.severity === 'critical' ? 'destructive' : 'default'}>{selected.code}</Badge>
                <h2 className="text-xl font-bold">{selected.title}</h2>
              </div>
              <p className="text-muted-foreground text-sm">{selected.description}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Probable Causes
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                {selected.causes.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-green-600">
                <Wrench className="w-4 h-4" />
                Solutions
              </h3>
              <div className="space-y-2">
                {selected.solutions.map((s, i) => (
                  <div key={i} className="p-3 bg-muted rounded-md text-sm">
                    {i + 1}. {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {results.length > 0 ? results.map(err => (
              <Card key={err.code} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(err)}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{err.code}</Badge>
                    <Badge variant={err.severity === 'critical' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                      {err.severity}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm mt-2">{err.title}</CardTitle>
                </CardHeader>
              </Card>
            )) : search.length > 1 ? (
              <div className="text-center py-10 text-muted-foreground">
                No local matches. Try the AI Assistant.
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Search for codes like E000, 5200, B200...
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    const userMsg = textToSend;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getTroubleshootingAdvice(userMsg, history);
    setMessages(prev => [...prev, { role: 'model', text: response || 'Error occurred' }]);
    setLoading(false);
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in slide-in-from-right-4 duration-500">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-4">
              <div className="p-4 bg-primary/5 rounded-full w-fit mx-auto">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Canon AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Ask me about any printer issue, configuration, or service procedure.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
                <Button variant="outline" size="sm" onClick={() => setInput("How to enter service mode on imageRUNNER Advance?")}>"How to enter service mode?"</Button>
                <Button variant="outline" size="sm" onClick={() => setInput("Troubleshoot SMB scan error 801")}>"SMB scan error 801"</Button>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border'
              }`}>
                <div className="markdown-body">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted border p-3 rounded-lg flex gap-1">
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="pt-4 flex gap-2">
        <Button 
          variant={isListening ? "destructive" : "outline"} 
          size="icon" 
          onClick={toggleListening}
          className={isListening ? "animate-pulse" : ""}
          disabled={!navigator.onLine}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Input 
          placeholder={navigator.onLine ? "Type your question..." : "AI Chat requires internet connection"} 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!navigator.onLine}
        />
        <Button onClick={() => handleSend()} disabled={loading || !navigator.onLine}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const Vision = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];
    const result = await diagnoseImage(base64Data, mimeType);
    setAnalysis(result || 'Failed to analyze');
    setLoading(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="border-dashed border-2">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          {image ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 rounded-full"
                onClick={() => { setImage(null); setAnalysis(null); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="py-10 space-y-4">
              <div className="p-4 bg-primary/5 rounded-full w-fit mx-auto">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Visual Diagnosis</h3>
                <p className="text-sm text-muted-foreground">Upload a photo of an error screen or a faulty part.</p>
              </div>
              <Input type="file" accept="image/*" className="hidden" id="camera-upload" onChange={handleFileChange} />
              <label 
                htmlFor="camera-upload" 
                className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Select Image
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {image && !analysis && (
        <Button className="w-full" onClick={handleAnalyze} disabled={loading || !navigator.onLine}>
          {loading ? "Analyzing..." : navigator.onLine ? "Start AI Diagnosis" : "Internet Required for AI Analysis"}
        </Button>
      )}

      {analysis && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="markdown-body">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'troubleshoot', label: 'Error Lookup', icon: Search },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'vision', label: 'Visual Diagnosis', icon: Camera },
    { id: 'network', label: 'Network/Scan', icon: Network },
    { id: 'service', label: 'Service Mode', icon: Settings },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'troubleshoot': return <Troubleshooting />;
      case 'chat': return <Chat />;
      case 'vision': return <Vision />;
      case 'network': return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-xl font-bold">Network & Scan Resolver</h2>
          <Tabs defaultValue="smb">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="smb">SMB Scan</TabsTrigger>
              <TabsTrigger value="smtp">SMTP/Email</TabsTrigger>
            </TabsList>
            <TabsContent value="smb" className="space-y-4 pt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>SMB v2/v3 Required</AlertTitle>
                <AlertDescription>Modern Canon printers require SMB v2 or v3. Ensure SMB v1 is disabled for security.</AlertDescription>
              </Alert>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-bold text-sm">Windows Setup Checklist:</h4>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Create dedicated 'Scanner' user with password</li>
                    <li>Share folder with 'Full Control' permissions</li>
                    <li>Allow 'File and Printer Sharing' in Firewall</li>
                    <li>Check Network Profile is set to 'Private'</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setActivePage('chat')}>Ask AI for specific SMB guide</Button>
              </div>
            </TabsContent>
            <TabsContent value="smtp" className="space-y-4 pt-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-bold text-sm">Gmail SMTP Settings:</h4>
                <div className="text-xs grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Server:</span> <span>smtp.gmail.com</span>
                  <span className="text-muted-foreground">Port:</span> <span>465 (SSL) or 587 (TLS)</span>
                  <span className="text-muted-foreground">Auth:</span> <span>App Password Required</span>
                </div>
              </div>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>Standard Gmail passwords no longer work. You must enable 2FA and generate an 'App Password'.</AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </div>
      );
      case 'service': return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-xl font-bold">Service Mode Guide</h2>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>DANGER</AlertTitle>
            <AlertDescription>Incorrect settings in Service Mode can render the machine inoperable. Proceed with extreme caution.</AlertDescription>
          </Alert>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">imageRUNNER ADVANCE Series</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>1. Press <strong>Settings/Registration</strong> button.</p>
                <p>2. Press <strong>2</strong> and <strong>8</strong> keys simultaneously.</p>
                <p>3. Press <strong>Settings/Registration</strong> button again.</p>
                <p className="text-xs text-muted-foreground mt-2 italic">Note: For some models, use the 'Head' icon on the touch screen instead.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">imageCLASS / MF Series</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>1. Press <strong>Menu</strong>.</p>
                <p>2. Press <strong>2</strong>, <strong>8</strong>, <strong>Menu</strong> in sequence.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Canon Service Pro</h1>
            {!isOnline && <Badge variant="destructive" className="ml-2 text-[10px]">OFFLINE</Badge>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-14"
          >
            <nav className="flex flex-col p-6 space-y-4">
              {!isOnline && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Offline Mode</AlertTitle>
                  <AlertDescription>AI features are disabled. Local error lookup is still available.</AlertDescription>
                </Alert>
              )}
              {deferredPrompt && (
                <Button variant="outline" className="justify-start text-lg h-14 border-primary text-primary" onClick={handleInstall}>
                  <Wrench className="mr-3 w-6 h-6" />
                  Install App
                </Button>
              )}
              {navItems.map((item) => (
                <Button 
                  key={item.id}
                  variant={activePage === item.id ? 'default' : 'ghost'}
                  className="justify-start text-lg h-14"
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon className="mr-3 w-6 h-6" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container px-4 py-6 max-w-md mx-auto">
        {renderPage()}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur flex justify-around items-center h-16 px-2 md:hidden">
        {navItems.slice(0, 4).map((item) => (
          <button 
            key={item.id}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activePage === item.id ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
        <button 
          className="flex flex-col items-center justify-center w-full h-full text-muted-foreground"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </nav>
      
      {/* Padding for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
