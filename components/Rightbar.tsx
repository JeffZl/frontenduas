'use client';

import { useState, useEffect } from 'react';
import UserItem from './UserItem';

interface Suggestion {
    _id: string;
    name: string;
    handle: string;
    avatar: string;
}

export default function Rightbar() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await fetch("/api/users/suggestions", {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    return (
        <section className="p-5 flex-col gap-5 hidden xl:flex border-l border-[#2f3336] flex-[1.5]">
            <div className="border border-[#2f3336] rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-2.5">Who to follow</h3>
                
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" />
                                    <div className="grow">
                                        <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-1" />
                                        <div className="w-24 h-3 bg-gray-700 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="w-20 h-8 bg-gray-700 rounded-full animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 text-sm">
                        <p>No suggestions available</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {suggestions.map(({ name, avatar, handle, _id }) => (
                            <UserItem key={_id} name={name} avatar={avatar} handle={handle} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}