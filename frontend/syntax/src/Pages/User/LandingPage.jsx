import React from 'react'
import { ChevronRight, Clock, Users, Lock, Award } from "lucide-react"
import { useNavigate } from 'react-router-dom'


function LandingPage() {
    const navigate=useNavigate()
    const CategoryCard = ({ title, description, icon, color, count }) => {
        return (
            <div className="group h-full overflow-hidden rounded-xl bg-gray-800 p-6 transition-all hover:bg-gray-750">
                <div className="mb-4">{icon}</div>
                <h3 className="mb-2 text-xl font-bold">{title}</h3>
                <p className="mb-4 text-gray-400">{description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{count} challenges</span>
                    <button
                        className={`flex items-center text-sm font-medium bg-gradient-to-r ${color} bg-clip-text text-transparent group-hover:underline`}
                    >
                        Explore <ChevronRight size={16} className="ml-1" />
                    </button>
                </div>
            </div>
        )
    }

    const StatCard = ({ icon, value, label }) => {
        return (
            <div className="flex flex-col items-center text-center">
                <div className="mb-3 text-indigo-400">{icon}</div>
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-gray-400">{label}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-700 opacity-20 blur-3xl"></div>
                    <div className="absolute top-40 -left-20 h-60 w-60 rounded-full bg-indigo-700 opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 right-20 h-40 w-40 rounded-full bg-blue-700 opacity-20 blur-3xl"></div>
                </div>
                <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                            <span className="block text-white">ESCAPE</span>
                            <span className="block bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                                CODE CHALLENGE
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-300">
                            Solve puzzles, escape rooms, and challenge your coding skills in this immersive tech adventure.
                        </p>
                        <div className="mt-10 flex justify-center gap-4">
                            <button onClick={()=>navigate('/login')} className="rounded-md cursor-pointer bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-500/50">
                                START ADVENTURE
                            </button>

                            <button className="rounded-md border border-indigo-400 bg-transparent px-8 py-3 font-bold text-indigo-400 transition-all hover:bg-indigo-900/30">
                                LEARN MORE
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
                        <path
                            fill="#111827"
                            fillOpacity="1"
                            d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
                        ></path>
                    </svg>
                </div>
            </section>
            <section className="bg-gray-900 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="mb-2 text-center text-3xl font-bold">Challenge Categories</h2>
                    <p className="mb-12 text-center text-gray-400">Pick your path and test your skills</p>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <CategoryCard
                            title="HTML & CSS"
                            description="Master the art of styling and layout to escape visual puzzles."
                            icon={
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                                    <span className="text-2xl font-bold">{"</>"}</span>
                                </div>
                            }
                            color="from-blue-500 to-cyan-400"
                            count={12}
                        />
                        <CategoryCard
                            title="JavaScript"
                            description="Solve dynamic puzzles that require logical thinking and code execution."
                            icon={
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-400 text-white">
                                    <span className="text-2xl font-bold">JS</span>
                                </div>
                            }
                            color="from-yellow-500 to-orange-400"
                            count={18}
                        />
                        <CategoryCard
                            title="Algorithms"
                            description="Navigate through complex algorithm challenges to find the optimal solution."
                            icon={
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-400 text-white">
                                    <span className="text-2xl font-bold">{"{ }"}</span>
                                </div>
                            }
                            color="from-purple-500 to-pink-400"
                            count={15}
                        />
                        <CategoryCard
                            title="Data Structures"
                            description="Build and manipulate data structures to solve complex puzzles."
                            icon={
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-400 text-white">
                                    <span className="text-2xl font-bold">DS</span>
                                </div>
                            }
                            color="from-green-500 to-emerald-400"
                            count={10}
                        />
                        <CategoryCard
                            title="Security"
                            description="Crack encryption, find vulnerabilities, and secure your way to freedom."
                            icon={
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-400 text-white">
                                    <Lock size={28} />
                                </div>
                            }
                            color="from-red-500 to-rose-400"
                            count={8}
                        />
                        <CategoryCard
                            title="Database"
                            description="Query your way through database challenges to unlock the next level."
                            icon={
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-400 text-white">
                                    <span className="text-2xl font-bold">SQL</span>
                                </div>
                            }
                            color="from-indigo-500 to-violet-400"
                            count={9}
                        />
                    </div>
                </div>
            </section>
            <section className="bg-gray-800 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <StatCard icon={<Users size={24} />} value="15,000+" label="Active Users" />
                        <StatCard icon={<Lock size={24} />} value="120+" label="Escape Rooms" />
                        <StatCard icon={<Award size={24} />} value="5,000+" label="Challenges Completed" />
                        <StatCard icon={<Clock size={24} />} value="480,000+" label="Minutes Played" />
                    </div>
                </div>
            </section>
            <section className="bg-gradient-to-r from-indigo-800 to-purple-900 py-16">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold">Ready to Accept the Challenge?</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100">
                        Join thousands of developers who are leveling up their skills while having fun.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                        <button className="rounded-md bg-white px-8 py-3 font-bold text-indigo-800 shadow-lg transition-all hover:bg-gray-100">
                            GET STARTED FOR FREE
                        </button>
                        <button className="rounded-md border border-white bg-transparent px-8 py-3 font-bold text-white transition-all hover:bg-white/10">
                            EXPLORE CHALLENGES
                        </button>
                    </div>
                </div>
            </section>
            <footer className="bg-gray-950 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="text-xl font-bold">EscapeCode</h3>
                            <p className="mt-4 text-gray-400">
                                The ultimate platform for developers to enhance their skills through engaging code challenges and escape
                                rooms.
                            </p>
                            <div className="mt-6 flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Discord</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Platform</h3>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Challenges
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Leaderboard
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Community
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Company</h3>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium">Legal</h3>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white">
                                        Code of Conduct
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-800 pt-8 text-center">
                        <p className="text-sm text-gray-400">© 2025 EscapeCode. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
