import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Calendar, Clock, Trash2, Loader2, AlertCircle, Check,
  Sparkles, Pin
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  tags: string;
  thumbnail_url: string;
  source_url: string;
}

interface Board {
  id: string;
  name: string;
  description: string;
  pin_count: number;
}

interface ScheduleItem {
  id: string;
  video_id: string;
  board_id: string;
  board_name: string;
  title: string;
  description: string;
  link: string;
  scheduled_at: string;
  status: string;
  thumbnail_url: string;
  error_message: string | null;
  published_at: string | null;
}

export default function Schedule() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedVideoId = searchParams.get("video");

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(!!preselectedVideoId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedVideo, setSelectedVideo] = useState(preselectedVideoId || "");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDesc, setScheduleDesc] = useState("");
  const [scheduleLink, setScheduleLink] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const pinterestConnected = user?.pinterest_connected;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVideo && videos.length > 0) {
      const video = videos.find((v) => v.id === selectedVideo);
      if (video) {
        setScheduleTitle(video.title || "");
        setScheduleDesc(video.description || "");
        setScheduleLink(video.source_url || "");
      }
    }
  }, [selectedVideo, videos]);

  async function loadData() {
    try {
      const [videosRes, schedulesRes] = await Promise.all([
        api.getVideos(),
        api.getSchedules(),
      ]);
      if (videosRes.ok) setVideos(await videosRes.json());
      if (schedulesRes.ok) setSchedules(await schedulesRes.json());

      if (pinterestConnected) {
        try {
          const boardsRes = await api.getPinterestBoards();
          if (boardsRes.ok) {
            const data = await boardsRes.json();
            setBoards(data.boards || []);
          }
        } catch {
          // Pinterest may not be connected
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!selectedVideo || !selectedBoard) {
      setError("Please select a video and board");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const board = boards.find((b) => b.id === selectedBoard);
      const res = await api.createSchedule({
        video_id: selectedVideo,
        board_id: selectedBoard,
        board_name: board?.name,
        title: scheduleTitle,
        description: scheduleDesc,
        link: scheduleLink,
        scheduled_at: scheduleTime || undefined,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Scheduling failed");
      }

      const newSchedule = await res.json();
      setSchedules((prev) => [newSchedule, ...prev]);
      setDialogOpen(false);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this scheduled post?")) return;
    try {
      const res = await api.deleteSchedule(id);
      if (res.ok) {
        setSchedules((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to cancel:", err);
    }
  }

  function resetForm() {
    setSelectedVideo("");
    setSelectedBoard("");
    setScheduleTitle("");
    setScheduleDesc("");
    setScheduleLink("");
    setScheduleTime("");
    setError("");
  }

  const scheduledPosts = schedules.filter((s) => s.status === "scheduled");
  const publishedPosts = schedules.filter((s) => s.status === "published");
  const failedPosts = schedules.filter((s) => s.status === "failed");

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
            <p className="text-slate-500 mt-1">Manage your Pinterest posting schedule.</p>
          </div>
          <Button
            variant="gradient"
            onClick={() => setDialogOpen(true)}
            disabled={!pinterestConnected || videos.length === 0}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>

        {!pinterestConnected && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Pinterest not connected</p>
                <p className="text-xs text-amber-600">
                  Connect your Pinterest account in Settings to start scheduling posts.
                </p>
              </div>
              <a href="/dashboard/settings" className="ml-auto">
                <Button variant="outline" size="sm">Connect</Button>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Posts */}
        <div className="space-y-6">
          {scheduledPosts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Upcoming ({scheduledPosts.length})
              </h2>
              <div className="space-y-3">
                {scheduledPosts.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {schedule.thumbnail_url && (
                            <img src={schedule.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{schedule.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{schedule.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {new Date(schedule.scheduled_at).toLocaleString()}
                            </div>
                            {schedule.board_name && (
                              <Badge variant="secondary" className="text-xs">
                                <Pin className="w-2.5 h-2.5 mr-1" />
                                {schedule.board_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="warning">Scheduled</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleCancel(schedule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {publishedPosts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Published ({publishedPosts.length})
              </h2>
              <div className="space-y-3">
                {publishedPosts.map((schedule) => (
                  <Card key={schedule.id} className="bg-green-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {schedule.thumbnail_url && (
                            <img src={schedule.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{schedule.title}</h3>
                          <p className="text-xs text-slate-500">{schedule.board_name}</p>
                        </div>
                        <Badge variant="success">Published</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {failedPosts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Failed ({failedPosts.length})
              </h2>
              <div className="space-y-3">
                {failedPosts.map((schedule) => (
                  <Card key={schedule.id} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {schedule.thumbnail_url && (
                            <img src={schedule.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">{schedule.title}</h3>
                          <p className="text-xs text-red-500">{schedule.error_message || "Publishing failed"}</p>
                        </div>
                        <Badge variant="destructive">Failed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {schedules.length === 0 && !loading && (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No scheduled posts</h3>
                <p className="text-slate-500 mb-6">Schedule your video pins for optimal engagement times.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Schedule Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Video Pin</DialogTitle>
              <DialogDescription>
                Select a video and board, and we'll auto-schedule at the optimal time.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Video</label>
                <Select value={selectedVideo} onValueChange={setSelectedVideo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a video" />
                  </SelectTrigger>
                  <SelectContent>
                    {videos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.title || "Untitled"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pinterest Board</label>
                {boards.length > 0 ? (
                  <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b.pin_count} pins)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Board ID (connect Pinterest for board list)"
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={scheduleDesc} onChange={(e) => setScheduleDesc(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link URL</label>
                <Input
                  type="url"
                  placeholder="https://"
                  value={scheduleLink}
                  onChange={(e) => setScheduleLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Schedule Time
                  <Badge variant="secondary" className="text-xs font-normal">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto if empty
                  </Badge>
                </label>
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
                <p className="text-xs text-slate-500">Leave empty for AI-optimized scheduling.</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="gradient" onClick={handleSchedule} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Post"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
