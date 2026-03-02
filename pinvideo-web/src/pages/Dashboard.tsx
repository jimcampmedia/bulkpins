import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Video, Calendar, TrendingUp, Clock,
  Image, Trash2, ExternalLink
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  tags: string;
  original_image_url: string;
  video_url: string;
  thumbnail_url: string;
  source_url: string;
  status: string;
  created_at: string;
}

interface ScheduleItem {
  id: string;
  video_id: string;
  board_name: string;
  title: string;
  scheduled_at: string;
  status: string;
  thumbnail_url: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [videosRes, schedulesRes] = await Promise.all([
        api.getVideos(),
        api.getSchedules(),
      ]);
      if (videosRes.ok) setVideos(await videosRes.json());
      if (schedulesRes.ok) setSchedules(await schedulesRes.json());
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(videoId: string) {
    if (!confirm("Delete this video? This will also cancel any scheduled posts.")) return;
    try {
      const res = await api.deleteVideo(videoId);
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== videoId));
        setSchedules((prev) => prev.filter((s) => s.video_id !== videoId));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  const upcomingSchedules = schedules.filter((s) => s.status === "scheduled");
  const publishedCount = schedules.filter((s) => s.status === "published").length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-slate-500 mt-1">Here's what's happening with your video pins.</p>
          </div>
          <Link to="/dashboard/create">
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Create Video Pin
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Video, label: "Total Videos", value: videos.length, color: "text-violet-500" },
            { icon: Calendar, label: "Scheduled", value: upcomingSchedules.length, color: "text-blue-500" },
            { icon: TrendingUp, label: "Published", value: publishedCount, color: "text-green-500" },
            { icon: Image, label: "This Month", value: user?.videos_used_this_month || 0, color: "text-pink-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Schedule */}
        {upcomingSchedules.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Posts</CardTitle>
                <Link to="/dashboard/schedule">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSchedules.slice(0, 3).map((schedule) => (
                  <div key={schedule.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                      {schedule.thumbnail_url && (
                        <img src={schedule.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{schedule.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {new Date(schedule.scheduled_at).toLocaleString()}
                        </span>
                        {schedule.board_name && (
                          <Badge variant="secondary" className="text-xs">{schedule.board_name}</Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="warning" className="flex-shrink-0">Scheduled</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Videos Grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Videos</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-slate-200 rounded-t-xl" />
                <CardContent className="p-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No videos yet</h3>
              <p className="text-slate-500 mb-6">Upload your first image and let AI create a stunning video pin.</p>
              <Link to="/dashboard/create">
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Link to={`/dashboard/schedule?video=${video.id}`}>
                        <Button size="sm" variant="secondary">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Schedule
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <Badge
                    variant={video.status === "ready" ? "success" : "warning"}
                    className="absolute top-2 right-2"
                  >
                    {video.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-slate-900 truncate mb-1">{video.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{video.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {video.tags?.split(",").slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      {video.source_url && (
                        <a href={video.source_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(video.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
