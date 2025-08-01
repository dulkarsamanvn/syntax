import axiosInstance from "@/api/axiosInstance"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import CodeMirror from "@uiw/react-codemirror"
import { oneDark } from "@codemirror/theme-one-dark"
import { python } from "@codemirror/lang-python"
import { javascript } from "@codemirror/lang-javascript"
import { cpp } from "@codemirror/lang-cpp"
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  X,
  Star,
  BarChart3,
  Share,
  ArrowRight,
  Timer
} from "lucide-react"
import toast from "react-hot-toast"

function ChallengeSolve() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [challenge, setChallenge] = useState(null)
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [activeTab, setActiveTab] = useState("description")
  const [consoleOutput, setConsoleOutput] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionData, setCompletionData] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [userId, setUserId] = useState(null)
  const [showSolutionModal, setShowSolutionModal] = useState(false)
  const [solutionDescription, setSolutionDescription] = useState('')
  const [solutionCode, setSolutionCode] = useState('')
  const [solutionLanguage, setSolutionLanguage] = useState('python')
  const [solutions, setSolutions] = useState([])
  const [editingSolution,setEditingSolution]=useState(null)
  const [editingSolutionDescription,setEditingSolutionDescription]=useState('')
  const [editingSolutionCode,setEditingSolutionCode]=useState('')
  const [editingSolutionLanguage,setEditingSolutionLanguage]=useState('')
  const [showDeleteModal,setShowDeleteModal]=useState(false)
  const [solutionToDelete,setSolutionToDelete]=useState(null)


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axiosInstance.get('/profile/')
        setUserId(res.data.id || res.data.username)
      } catch (err) {
        console.error("error fetching profile", err)
      }
    }

    fetchUserProfile()
  }, [])

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await axiosInstance.get(`/challenge/${id}/`)
        setChallenge(res.data)
        if (userId) {
          const savedCode = localStorage.getItem(`challenge_code_${res.data.id}_python_${userId}`)
          if (savedCode && savedCode.trim() !== '') {
            setCode(savedCode)
          } else {
            setCode(res.data.initial_code?.["python"] || "")
          }
        } else {
          setCode(res.data.initial_code?.["python"] || "")
        }
        setTimeLeft(res.data.time_limit * 60)
      } catch (err) {
        console.error("error fetching challenge", err)
        if (err.response?.status === 403) {
          navigate('/home')
        } else if (err.response?.status === 404) {
          navigate('/home')
        }
      }
    }
    fetchChallenge()
  }, [id, userId])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axiosInstance.get(`/challenge/${id}/submissions/`)
        setSubmissions(res.data)
      } catch (err) {
        console.error("error fetching submission", err)
      }
    }
    if (activeTab === 'submissions') {
      fetchSubmissions()
    }

  }, [id, activeTab])

  const fetchSolutions = async () => {
    try {
      const res = await axiosInstance.get(`/challenge/${id}/solutions/`)
      setSolutions(res.data)

    } catch (err) {
      console.error('error fetching solutions', err)
    }
  }


  useEffect(() => {
    fetchSolutions()
  }, [])

  const handleAddSolution = async () => {
    if (editingSolution) {
      if (!editingSolutionCode || !editingSolutionDescription) {
        console.log('ERROR: Missing required fields for editing');
        return;
      }
    } else {
      if (!solutionCode || !solutionDescription) {
        console.log('ERROR: Missing required fields for creation');
        return;
      }
    }

    try {
      if(editingSolution){
        await axiosInstance.put(`/challenge/${id}/edit-solution/${editingSolution.id}/`,{
          code: editingSolutionCode,
          description: editingSolutionDescription,
          language: editingSolutionLanguage
        })
        toast.success('solution updated successfully')
        setEditingSolution(null);
        setEditingSolutionDescription('');
        setEditingSolutionCode('');
        setEditingSolutionLanguage('python');
      }else{
        await axiosInstance.post(`/challenge/${id}/add-solution/`, {
          code: solutionCode,
          description: solutionDescription,
          language: solutionLanguage
        })
        toast.success('solution added successfully')
        setSolutionCode('');
        setSolutionDescription('');
        setSolutionLanguage('python');
      }
      setShowSolutionModal(false)

      await fetchSolutions()
    } catch (err) {
      console.error('error adding/editing solution', err)
    }
  }
  

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0")
    const s = String(secs % 60).padStart(2, "0")
    return `${m}:${s}`
  }

  const handleStart = () => {
    setTimerActive(true)
    setCode(challenge.initial_code?.[language] || "")
  }

  const handleReset = () => {
    setCode(challenge.initial_code?.[language] || "")
  }

  const handleRun = async () => {
    setIsRunning(true)
    setConsoleOutput([{ type: "info", message: "Running test cases..." }])
    try {
      const res = await axiosInstance.post("/challenge/run/", {
        challenge_id: challenge.id,
        code: code,
        language: language,
      })
      setConsoleOutput(res.data.console_output)
      setTestResults(res.data.result_summary)
    } catch (err) {
      console.error(err)
      setConsoleOutput([{ type: "error", message: "Execution error. Please try again." }])
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setConsoleOutput([{ type: "info", message: "Running and submitting test cases..." }])
    try {
      const res = await axiosInstance.post("/challenge/submit/", {
        challenge_id: challenge.id,
        code,
        language,
      })
      toast.success('challenge submitted successfully')
      setConsoleOutput(res.data.console_output)
      setTestResults(res.data.result_summary)
      const hasError = res.data.console_output.some((log) => log.type === "error")
      if (!hasError && res.data.result_summary?.is_completed) {
        const completionTime = challenge.time_limit * 60 - timeLeft
        setTimerActive(false)
        setCompletionData({
          title: challenge.title,
          time: formatTime(completionTime),
          attempts: res.data.result_summary.attempts,
          difficulty: challenge.difficulty,
          xpEarned: res.data.result_summary.xp_awarded,
        })
        setTimeout(() => {
          setShowCompletionModal(true)
        }, 500)
      }
    } catch (err) {
      console.error("error", err)
      setConsoleOutput([{ type: "error", message: "Submission failed. Please try again." }])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (userId && challenge) {
      const savedCode = localStorage.getItem(`challenge_code_${challenge.id}_${lang}_${userId}`)
      if (savedCode && savedCode.trim() !== '') {
        setCode(savedCode)
      } else {
        setCode(challenge.initial_code?.[lang] || "")
      }
    } else {
      setCode(challenge.initial_code?.[lang] || "")
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleCloseModal = () => {
    setShowCompletionModal(false)
    setTimerActive(false)
    setTimeLeft(challenge.time_limit * 60)
    setTestResults(null)
    setConsoleOutput([])

  }

  const handleNextChallenge = () => {
    setShowCompletionModal(false)
    navigate("/home")
  }

  const handleDeleteSolution=async()=>{
    try{
      await axiosInstance.delete(`/challenge/${id}/delete-solution/${solutionToDelete}/`)
      setSolutions(prev=>prev.filter((s)=>s.id !== solutionToDelete))
      setShowDeleteModal(false)
      setSolutionToDelete(null)
    }catch(err){
      console.error('error deleting solutions',err)
    }

  }

  const handleLeaderboard = () => {
    setShowCompletionModal(false)
    navigate('/leaderboard')
  }

  if (!challenge) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const isTimeUp = timeLeft <= 0
  const isTimerRunning = timerActive && !isTimeUp

  const tabs = [
    { id: "description", label: "Description" },
    { id: "solutions", label: "Solutions" },
    { id: "submissions", label: "Submissions" },
  ]

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleBack} className="flex items-center space-x-2 text-gray-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <h1 className="text-lg font-semibold text-white">{challenge.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold ${isTimeUp
                ? "bg-red-900 text-red-300"
                : timeLeft < 300
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-blue-900 text-blue-300"
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            {!timerActive && (
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Challenge</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-700 bg-gray-800">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id
                    ? "border-blue-500 text-blue-400 bg-gray-700"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "description" && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-300 leading-relaxed">{challenge.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Instructions</h3>
                  <p className="text-gray-300 leading-relaxed">{challenge.instructions}</p>
                </div>
                {challenge.hints && (
                  <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-300 mb-2 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Hints
                    </h3>
                    <p className="text-yellow-200">{challenge.hints}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Examples</h3>
                  <div className="space-y-4">
                    {challenge.test_cases
                      .filter((tc) => !tc.hidden)
                      .map((tc, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-semibold text-gray-400">Input:</span>
                              <pre className="mt-1 bg-gray-700 p-2 rounded text-sm font-mono text-green-300">
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-400">Output:</span>
                              <pre className="mt-1 bg-gray-700 p-2 rounded text-sm font-mono text-green-300">
                                {tc.output}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "solutions" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Community Solutions</h3>
                  <button
                    onClick={() => setShowSolutionModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <span>Add Solution</span>
                  </button>
                </div>

                {solutions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-2">No solutions yet</p>
                    <p className="text-gray-600 text-sm">Be the first to share your solution!</p>
                  </div>
                ) : (
                  solutions.map((sol) => (
                    <div key={sol.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm text-gray-400 font-medium">
                          By {sol.username} — {new Date(sol.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-semibold text-blue-400">
                          {sol.user===userId && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingSolution(sol);
                                  setEditingSolutionDescription(sol.description);
                                  setEditingSolutionCode(sol.code);
                                  setEditingSolutionLanguage(sol.language);
                                  
                                  // Clear the regular solution state variables
                                  setSolutionCode('');
                                  setSolutionDescription('');
                                  setSolutionLanguage('python');
                                  
                                  setShowSolutionModal(true);
                                }}
                                className="text-blue-400 hover:underline text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSolutionToDelete(sol.id)
                                  setShowDeleteModal(true)
                                }}
                                className="text-red-400 hover:underline text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-white font-medium">{sol.description}</p>
                      </div>

                      <div className="text-xs text-gray-400 mb-3">
                        <span>
                          Language: <span className="text-white font-medium">{sol.language}</span>
                        </span>
                      </div>

                      <pre className="mt-2 bg-gray-900 p-2 rounded text-sm text-gray-300 overflow-x-auto border border-gray-600">
                        <code>{sol.code}</code>
                      </pre>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === "submissions" && (
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-2">No submissions yet</p>
                    <p className="text-gray-600 text-sm">Start coding to see your submissions here</p>
                  </div>

                ) : (
                  submissions.map((s, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm text-white-400 font-medium">
                          Submitted on {new Date(s.created_at).toLocaleDateString()}
                        </div>
                        <div
                          className={`text-sm font-semibold ${s.is_completed ? "text-green-400" : "text-red-400"
                            }`}
                        >
                          {s.is_completed ? "Completed" : "Incomplete"}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mb-3 flex items-center space-x-4">
                        <span>
                          Language: <span className="text-white font-medium">{s.language}</span>
                        </span>
                        <span>
                          Passed:{" "}
                          <span className="text-white font-medium">
                            {s.passed_test_cases}/{s.total_test_cases}
                          </span>
                        </span>
                        <span>
                          Runtime: <span className="text-white font-medium">{s.runtime}s</span>
                        </span>
                        <span>
                          XP: <span className="text-green-400 font-medium">+{s.xp_awarded}</span>
                        </span>
                      </div>
                      <pre className="mt-2 bg-gray-900 p-2 rounded text-sm text-gray-300 overflow-x-auto border border-gray-600">
                        {s.code}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTimeUp}
              >
                {challenge.initial_code &&
                  Object.keys(challenge.initial_code).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-700 text-sm"
                disabled={!timerActive || isTimeUp}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">
                {isTimeUp ? "Time's up!" : isTimerRunning ? "Active" : "Ready"}
              </span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <CodeMirror
              value={code}
              height="100%"
              theme={oneDark}
              extensions={[
                language === "python"
                  ? python()
                  : language === "javascript"
                    ? javascript()
                    : language === "cpp"
                      ? cpp()
                      : [],
              ]}
              onChange={(value) => {
                setCode(value)
                if (userId && challenge) {
                  localStorage.setItem(`challenge_code_${challenge.id}_${language}_${userId}`, value)
                }
              }}
              readOnly={!timerActive || isTimeUp}
            />
            {(!timerActive || isTimeUp) && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-300 text-lg mb-2">
                    {!timerActive ? 'Click "Start Challenge" to begin coding' : "Time's up!"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-end">
            <div className="flex space-x-3">
              <button
                onClick={handleRun}
                disabled={!timerActive || isTimeUp || isRunning}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium text-sm"
              >
                <Play className="w-4 h-4" />
                <span>{isRunning ? "Running..." : "Run"}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!timerActive || isTimeUp || isSubmitting}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium text-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
              </button>
            </div>
          </div>

          {/* Console */}
          <div className="h-48 border-t border-gray-700 bg-black flex flex-col">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Console</span>
              <button onClick={() => setConsoleOutput([])} className="text-xs text-gray-400 hover:text-white">
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {consoleOutput.length === 0 ? (
                <div className="text-gray-500">Console output will appear here...</div>
              ) : (
                <div className="space-y-1">
                  {consoleOutput.map((output, idx) => (
                    <div key={idx}>
                      <div
                        className={`${output.type === "error"
                          ? "text-red-400"
                          : output.type === "success"
                            ? "text-green-400"
                            : output.type === "warning"
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                      >
                        {output.type === "error" && <XCircle className="w-4 h-4 inline mr-2" />}
                        {output.type === "success" && <CheckCircle className="w-4 h-4 inline mr-2" />}
                        {output.message}
                      </div>
                      {output.details && (
                        <div className="ml-6 text-gray-400 text-xs mt-1">
                          <div>Input: {output.details.input}</div>
                          {"expected" in output.details && <div>Expected: {output.details.expected}</div>}
                          {"actual" in output.details && <div>Actual: {output.details.actual}</div>}
                          {"error" in output.details && (
                            <div className="text-red-400 whitespace-pre-wrap">Error: {output.details.error}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && completionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred Background Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex">
              {/* Left Side - Completion Info */}
              <div className="flex-1 p-8 text-white">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-yellow-300" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Challenge Completed!</h2>
                  <h3 className="text-xl text-blue-100">{completionData.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-sm text-blue-200 mb-1">Time</div>
                    <div className="text-2xl font-bold">{completionData.time}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-200 mb-1">Attempts</div>
                    <div className="text-2xl font-bold">{completionData.attempts}</div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="text-sm text-blue-200 mb-2">Difficulty</div>
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${completionData.difficulty === "Easy"
                      ? "bg-green-500"
                      : completionData.difficulty === "Medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                      }`}
                  >
                    {completionData.difficulty}
                  </div>
                </div>

                {/* <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="text-sm text-blue-200 mb-1">Level Progress</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                      style={{ width: "68%" }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-200 mt-1">Lvl 4 (68%)</div>
                </div> */}
              </div>

              {/* Right Side - Rewards */}
              <div className="w-80 bg-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Rewards Earned</h3>

                <div className="space-y-4 mb-8">
                  <div className="bg-blue-600 rounded-lg p-4 flex items-center space-x-3">
                    <Star className="w-6 h-6 text-blue-200" />
                    <div>
                      <div className="text-xs text-blue-200">XP Points</div>
                      <div className="text-lg font-bold text-white">+{completionData.xpEarned}</div>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-300 mb-2">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-sm font-medium">Next Challenge</span>
                  </div>
                  <div className="text-xs text-gray-400">Complete next challenge to earn more XP</div>
                </div> */}

                <div className="space-y-3">
                  <button onClick={handleLeaderboard} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>Leaderboard</span>
                  </button>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors">
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={handleNextChallenge}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <span>Next Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ------------------- */}
      {showSolutionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">
                  {editingSolution ? 'Edit Solution' : 'Create New Solution'}
                </h3>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    type="text"
                    placeholder="Enter Description"
                    value={editingSolution? editingSolutionDescription : solutionDescription}
                    onChange={(e) =>{
                      if (editingSolution) {
                        setEditingSolutionDescription(e.target.value)
                      } else {
                        setSolutionDescription(e.target.value)
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={editingSolution? editingSolutionLanguage : solutionLanguage}
                    onChange={(e) => {
                      if (editingSolution) {
                        setEditingSolutionLanguage(e.target.value)
                      } else {
                        setSolutionLanguage(e.target.value)
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400 resize-none"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                  </select>
                </div>
                <CodeMirror
                  value={editingSolution? editingSolutionCode: solutionCode}
                  height="200px"
                  theme={oneDark}
                  onChange={(value) =>{
                    if (editingSolution) {
                      setEditingSolutionCode(value)
                    } else {
                      setSolutionCode(value)
                    }
                  }}
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowSolutionModal(false)
                    setEditingSolution(null)
                    setEditingSolutionDescription('')
                    setEditingSolutionCode('')
                    setEditingSolutionLanguage('python')
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={()=>{
                    console.log('BUTTON CLICKED - Starting handleAddSolution');
                    handleAddSolution()
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
                >
                  {editingSolution? 'Update' : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ------------------- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-xl shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Delete Solution</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this solution? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSolutionToDelete(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSolution}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChallengeSolve
