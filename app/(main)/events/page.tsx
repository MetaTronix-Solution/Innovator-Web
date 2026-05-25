"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarDays, AlertCircle } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

const EventSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-card border border-border rounded-xl p-6 animate-pulse"
      >
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-full mb-2" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    ))}
  </div>
);

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (signal: AbortSignal) => {
    try {
      setLoading(true);
      const response = await fetch("/api/events", { signal });
      if (!response.ok) throw new Error("Server returned an error");

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name !== "AbortError")
        setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [fetchEvents]);

  if (loading) return <EventSkeleton />;
  if (error)
    return (
      <div className="flex items-center gap-2 text-destructive p-4 border border-destructive rounded-lg">
        <AlertCircle size={20} /> {error}
      </div>
    );

  return (
    <main className="container max-w-4xl py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Discover what's happening near you.
        </p>
      </header>

      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="grid gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      )}
    </main>
  );
}

const EmptyState = () => (
  <div className="flex flex-col items-center py-20 border border-dashed rounded-xl">
    <CalendarDays size={48} className="text-muted-foreground mb-4" />
    <p className="font-medium text-foreground">No events available</p>
  </div>
);

const EventCard = ({ event }: { event: Event }) => (
  <article className="bg-card border p-6 rounded-xl hover:shadow-md transition-shadow">
    <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
    <p className="text-muted-foreground text-sm leading-relaxed">
      {event.description}
    </p>
  </article>
);
