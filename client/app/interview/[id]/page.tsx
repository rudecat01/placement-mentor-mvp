"use client";

import { useEffect, useState } from "react";
import { 
  Video, 
  Book, 
  FileText, 
  Code2, 
  EyeOff, 
  Settings, 
  MessageSquare, 
  MicOff, 
  BrainCircuit, 
  BarChart2 
} from "lucide-react";
import Image from "next/image";

export default function InterviewSimulation() {
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="bg-bg-page text-on-background h-screen flex flex-col overflow-hidden">
      {/* Top Navigation / Header */}
      <nav aria-label="Top AppBar" className="bg-surface border-b border-border-subtle flex items-center justify-between px-margin-desktop z-40 h-16 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-headline-sm text-[20px] font-bold text-primary">placeMate</span>
          <div className="h-6 w-[1px] bg-border-subtle mx-2"></div>
          <div className="flex items-center gap-2">
            <Video className="text-primary w-5 h-5" />
            <span className="font-body-md text-[16px] font-bold text-on-surface">Round 2: DSA Coding</span>
          </div>
          <div className="h-6 w-[1px] bg-border-subtle mx-2"></div>
          <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <Book className="text-secondary w-5 h-5" />
            <span className="font-body-md text-[16px] font-medium text-secondary">Resource Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors mr-4">
            <FileText className="text-secondary w-5 h-5" />
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] text-secondary uppercase tracking-wider">Career</span>
              <span className="font-body-sm text-[14px] font-bold text-on-surface">ATS Analysis</span>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-border-subtle mr-4"></div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="font-label-md text-[14px] text-secondary uppercase tracking-wider">Time Remaining</span>
              <span className="font-label-md text-[14px] text-status-error font-bold">{timeString}</span>
            </div>
            <div className="w-32 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "25%" }}></div>
            </div>
          </div>
          <button className="bg-primary text-on-primary font-label-md text-[14px] px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-container transition-colors">
            End Interview
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] gap-px bg-border-subtle overflow-hidden">
        
        {/* Left Panel: Coding Sandbox */}
        <section className="bg-bg-surface flex flex-col h-full overflow-hidden relative">
          <header className="bg-surface-container-low border-b border-border-subtle px-4 py-2 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="text-secondary w-4 h-4" />
              <span className="font-label-md text-[14px] text-on-surface font-semibold">Solution.py</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-[12px] text-status-warning flex items-center gap-1">
                <EyeOff className="w-4 h-4" />
                Interview Mode (Strict)
              </span>
              <button className="text-secondary hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-bg-page p-4 font-code-block text-[14px] text-on-surface">
            <div className="flex">
              <div className="w-8 shrink-0 text-secondary text-right pr-4 select-none opacity-50 flex flex-col">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
              </div>
              <div className="flex-1 whitespace-pre font-mono outline-none">
                <span className="text-primary-container font-bold">def</span> <span className="text-blue-team">findKthLargest</span>(nums, k):
{"\n"}    <span className="text-secondary italic"># Min-heap approach</span>
{"\n"}    import heapq
{"\n"}    
{"\n"}    heap = []
{"\n"}    <span className="text-primary-container font-bold">for</span> num <span className="text-primary-container font-bold">in</span> nums:
{"\n"}        heapq.heappush(heap, num)
{"\n"}        <span className="text-primary-container font-bold">if</span> len(heap) &gt; k:
{"\n"}            heapq.heappop(heap)
{"\n"}            
{"\n"}    <span className="text-primary-container font-bold">return</span> heap[0]
              </div>
            </div>
          </div>

          {/* Terminal/Console Area */}
          <div className="h-1/3 bg-tertiary border-t border-tertiary-fixed-dim flex flex-col shrink-0">
            <div className="bg-tertiary-container px-4 py-1 flex items-center gap-4 border-b border-tertiary-fixed-dim">
              <span className="font-label-sm text-[12px] text-on-tertiary">Console Output</span>
            </div>
            <div className="flex-1 p-4 font-code-block text-[14px] text-on-tertiary overflow-auto whitespace-pre font-mono">
              &gt; Running tests...
{"\n"}&gt; Test Case 1: Passed
{"\n"}&gt; Test Case 2: Passed
{"\n"}&gt; <span className="text-status-success">All test cases passed.</span> Time complexity: O(N log K). Space complexity: O(K).
            </div>
          </div>
        </section>

        {/* Center Panel: Live Transcript */}
        <section className="bg-bg-surface flex flex-col h-full overflow-hidden">
          <header className="bg-surface-container-low border-b border-border-subtle px-4 py-2 flex items-center gap-2 shrink-0">
            <MessageSquare className="text-secondary w-4 h-4" />
            <span className="font-label-md text-[14px] text-on-surface font-semibold">Live Transcript</span>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Interviewer Message */}
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-secondary-container shrink-0 flex items-center justify-center border border-border-subtle overflow-hidden">
                <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-D3KrLbE3ymsrIIlyFzmWEzcxk0tQR5etDNzJNspC1LUcsBEtGUSBbP4TCzVi3qxfSkr4q0FHinT3R7eBA3qaoslDvKF5ly2ZXy_m929qcW4Lb3acbB5B5wx_KTUBsdAFu0JcoJkDnt_HxAXIkDPdZpfzSyvRxB-R2gVLj2nSIwdgA6TjDwJgASUoBYVbGodKPM_kGfzidzC85Z7RhB0Q2x8_kVrrAK7j8hAa8pZiIMppDo5IT8_L" alt="Interviewer" width={32} height={32} className="w-full h-full object-cover" unoptimized />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-[12px] text-on-surface font-bold">Alex (Interviewer)</span>
                  <span className="font-label-sm text-[12px] text-secondary">10:12 AM</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none font-body-sm text-[14px] text-on-surface border border-border-subtle">
                  That approach looks solid for standard inputs. However, what if the array is extremely large and cannot fit entirely into memory? How would you modify your approach?
                </div>
              </div>
            </div>

            {/* Candidate Message */}
            <div className="flex gap-4 max-w-[85%] self-end flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-primary-container shrink-0 flex items-center justify-center text-on-primary font-label-md text-[14px]">
                US
              </div>
              <div className="flex flex-col gap-1 items-end">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-[12px] text-secondary">10:14 AM</span>
                  <span className="font-label-sm text-[12px] text-on-surface font-bold">You</span>
                </div>
                <div className="bg-primary-fixed p-3 rounded-lg rounded-tr-none font-body-sm text-[14px] text-primary-container border border-primary-fixed-dim">
                  If the data is too large for memory, we could use a distributed approach or external sorting. But sticking to the min-heap, we could process the data in chunks. Since the heap only needs to maintain &apos;k&apos; elements, as long as &apos;k&apos; fits in memory, we can stream the data through the heap.
                </div>
              </div>
            </div>

            {/* Interviewer Typing Indicator */}
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-secondary-container shrink-0 flex items-center justify-center border border-border-subtle overflow-hidden">
                <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBkjP0kR6kw_Tn2hQFRHvG5vA9r0w7VLxl3z8lFV2hLVdJw21zeflkaGxT8OKX4jCp9A2R5ty7RROr5kezqYUNB1UDJRoi2YZCr7qSNob-MNJM8cwCimdR9C-UKfSnz2eqUCpi3XLh_T7R42dfLZHKATpVDIdLwoN0cw1kOu7Iq305epTRtPxYvC4fF1-uTLlMmtjZXybQEq8ZafVSyuCLn6pFJNYdWe7_1DDChSfxCZ7ahN3hUzJ3" alt="Interviewer" width={32} height={32} className="w-full h-full object-cover" unoptimized />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-[12px] text-on-surface font-bold">Alex (Interviewer)</span>
                </div>
                <div className="p-3 font-body-sm text-[14px] text-secondary flex items-center gap-1 h-[42px]">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Input visualization */}
          <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-border-subtle cursor-pointer hover:bg-surface-dim transition-colors">
                <MicOff className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-label-sm text-[12px] text-secondary">Microphone Muted</span>
            </div>
            {/* Minimal waveform placeholder */}
            <div className="flex items-center gap-1 h-6 opacity-30">
              <div className="w-1 h-2 bg-on-surface-variant rounded-full"></div>
              <div className="w-1 h-4 bg-on-surface-variant rounded-full"></div>
              <div className="w-1 h-3 bg-on-surface-variant rounded-full"></div>
              <div className="w-1 h-1 bg-on-surface-variant rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Right Panel: Interviewer State & Shadow Critic */}
        <section className="bg-surface flex flex-col h-full overflow-hidden relative">
          <header className="bg-surface-container-low border-b border-border-subtle px-4 py-2 flex items-center gap-2 shrink-0">
            <BrainCircuit className="text-secondary w-4 h-4" />
            <span className="font-label-md text-[14px] text-on-surface font-semibold">Interviewer State</span>
          </header>
          
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Current Question Card */}
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
              <h3 className="font-label-sm text-[12px] text-secondary uppercase tracking-wider mb-2">Current Focus</h3>
              <p className="font-body-md text-[16px] text-on-surface font-medium leading-relaxed">
                Find the Kth largest element in an unsorted array. Note that it is the kth largest element in the sorted order, not the kth distinct element.
              </p>
            </div>

            {/* Voice UI Status */}
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-blue-team shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
              <span className="font-label-md text-[14px] text-on-surface">Interviewer is Analyzing...</span>
            </div>

            <hr className="border-border-subtle my-2" />

            {/* Shadow Critic Overlay */}
            <div className="bg-surface-container-low border border-border-subtle rounded-lg p-4 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-label-sm text-[12px] text-secondary uppercase tracking-wider flex items-center gap-1">
                  <BarChart2 className="w-4 h-4" />
                  Shadow Critic (Live)
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                {/* Metric 1 */}
                <div>
                  <div className="flex justify-between font-label-sm text-[12px] mb-1">
                    <span className="text-on-surface">Technical Correctness</span>
                    <span className="text-status-success font-bold">Strong</span>
                  </div>
                  <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-status-success" style={{ width: "85%" }}></div>
                  </div>
                </div>
                {/* Metric 2 */}
                <div>
                  <div className="flex justify-between font-label-sm text-[12px] mb-1">
                    <span className="text-on-surface">Communication Clarity</span>
                    <span className="text-primary font-bold">Adequate</span>
                  </div>
                  <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "65%" }}></div>
                  </div>
                </div>
                {/* Metric 3 */}
                <div>
                  <div className="flex justify-between font-label-sm text-[12px] mb-1">
                    <span className="text-on-surface">Pressure Handling</span>
                    <span className="text-status-warning font-bold">At Risk</span>
                  </div>
                  <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-status-warning" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
              <p className="font-body-sm text-[14px] text-secondary mt-4 pt-4 border-t border-border-subtle">
                Note: Communication is slightly technical. Consider explaining the trade-offs between QuickSelect and Min-Heap more verbally.
              </p>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
}
