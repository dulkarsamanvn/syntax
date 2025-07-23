import axiosInstance from "@/api/axiosInstance"
import { useEffect, useState } from "react"
import { X, Code, TestTube, Settings, Languages, Lightbulb, Clock } from "lucide-react"

function CreateChallengeModal({ isOpen, onClose, onSuccess,isEdit,challengeId,initialData }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    difficulty: "easy",
    test_cases: [],
    time_limit: 2,
    tags: [],
    hints: [],
    required_skills: [],
    is_premium: false,
    function_signature: "",
    initial_code: {},
    solution_code: {},
    is_active: true,
    start_time: "",
    end_time: "",
    xp_reward: 10,
    languages: [],
  })

  const [message, setMessage] = useState("")
  const [activeSection, setActiveSection] = useState("basic")

  useEffect(()=>{
    if(isEdit && initialData){
      setForm({
        ...form,
        ...initialData,
        start_time: initialData.start_time ? initialData.start_time.slice(0, 16) : "",
        end_time: initialData.end_time ? initialData.end_time.slice(0, 16) : "",
      })
    }
  },[isEdit,initialData])

  const languagesList = ["python", "c", "javascript", "cpp", "java"]

  const handleChange = (e) => {
    const { type, name, value, checked } = e.target
    setForm({ ...form, [name]: type === "checkbox" ? checked : value })
  }

  const handleArrayChange = (field, index, value) => {
    const updated = [...form[field]]
    updated[index] = value
    setForm({ ...form, [field]: updated })
  }

  const handleTestCaseChange = (index, key, value) => {
    const updated = [...form.test_cases]
    updated[index][key] = value
    setForm({ ...form, test_cases: updated })
  }

  const addTestCase = () => {
    setForm({
      ...form,
      test_cases: [...form.test_cases, { input: "", output: "", hidden: false }],
    })
  }

  const removeTestCase = (index) => {
    const updated = [...form.test_cases]
    updated.splice(index, 1)
    setForm({ ...form, test_cases: updated })
  }

  const removeHint = (index) => {
    const updated = [...form.hints]
    updated.splice(index, 1)
    setForm({ ...form, hints: updated })
  }

  const formatDateTime=(datetimeStr)=>{
    if(!datetimeStr) return null
    const date=new Date(datetimeStr)
    return date.toISOString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!form.title.trim()) {
      setMessage("Title is required.")
      return
    }
    if (!form.description.trim()) {
      setMessage("Description is required.")
      return
    }
    if (!form.instructions.trim()) {
      setMessage("Instructions are required.")
      return
    }

    if (!form.function_signature.trim()) {
      setMessage("Function signature is required.")
      return
    }

    
    if (form.languages.length === 0) {
      setMessage("Please select at least one supported language.")
      return
    }

    if (parseInt(form.xp_reward) < 1) {
      setMessage("XP reward must be at least 1.")
      return
    }


    for (const lang of form.languages) {
      if (!form.initial_code[lang] || !form.solution_code[lang]) {
        setMessage(`Initial and solution code are required for ${lang}`)
        return
      }
    }

    if(form.start_time && form.end_time && new Date(form.end_time) <= new Date(form.start_time) ){
      setMessage("End time must be after start time")
      return
    }

    const cleanedForm = {
      ...form,
      start_time:formatDateTime(form.start_time),
      end_time:formatDateTime(form.end_time),
      test_cases: form.test_cases.filter((tc) => tc.input && tc.output),
      tags: form.tags.filter((tag) => tag.trim() != ""),
      hints: form.hints.filter((hint) => hint.trim() != ""),
      required_skills: form.required_skills.filter((skill) => skill.trim() !== ""),
    }

    try {
      if(isEdit && challengeId){
        await axiosInstance.patch(`/challenge/${challengeId}/update/`,cleanedForm)
        setMessage('challenge updated successfully')
      }else{
        await axiosInstance.post("/challenge/create/", cleanedForm)
        setMessage("Challenge created successfully")
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Challenge Submission failed", error)
      // setMessage("Failed to create challenge. Please try again.")
      if (error.response) {
        console.log("Backend error response:", error.response.data);
        setMessage(JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  if (!isOpen) return null

  const sections = [
    { id: "basic", label: "Basic Info", icon: Settings },
    { id: "languages", label: "Languages", icon: Languages },
    { id: "code", label: "Code Templates", icon: Code },
    { id: "tests", label: "Test Cases", icon: TestTube },
    { id: "hints", label: "Hints & Schedule", icon: Lightbulb },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">{isEdit ? 'Edit Challenge' : 'Create New Challenge'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 text-center font-medium ${
              message.includes("successfully")
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            } border-b`}
          >
            {message}
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon size={20} />
                    {section.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                {/* Basic Info Section */}
                {activeSection === "basic" && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Challenge Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Enter challenge title"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe the challenge"
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                          <textarea
                            name="instructions"
                            value={form.instructions}
                            onChange={handleChange}
                            placeholder="Detailed instructions for solving the challenge"
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                          <select
                            name="difficulty"
                            value={form.difficulty}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Function Signature</label>
                          <input
                            name="function_signature"
                            value={form.function_signature}
                            onChange={handleChange}
                            placeholder="def solution(params):"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (Minutes)</label>
                          <input
                            type="number"
                            name="time_limit"
                            value={form.time_limit}
                            onChange={handleChange}
                            min="2"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                          <input
                            type="number"
                            name="xp_reward"
                            value={form.xp_reward}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            name="is_premium"
                            checked={form.is_premium}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          Premium Challenge
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages Section */}
                {activeSection === "languages" && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Languages size={24} />
                        Supported Languages
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Select the programming languages that will be supported for this challenge.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {languagesList.map((lang) => (
                          <label
                            key={lang}
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              form.languages.includes(lang)
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={form.languages.includes(lang)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...form.languages, lang]
                                  : form.languages.filter((l) => l !== lang)
                                setForm({ ...form, languages: updated })
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="font-medium capitalize">{lang}</span>
                          </label>
                        ))}
                      </div>
                      {form.languages.length === 0 && (
                        <p className="text-red-500 text-sm mt-2">Please select at least one language.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Code Templates Section */}
                {activeSection === "code" && (
                  <div className="space-y-6">
                    {form.languages.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <Code size={48} className="mx-auto text-yellow-500 mb-4" />
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Languages Selected</h3>
                        <p className="text-yellow-700">Please select languages in the Languages section first.</p>
                      </div>
                    ) : (
                      form.languages.map((lang) => (
                        <div key={lang} className="bg-white border border-gray-200 rounded-xl p-6">
                          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2 capitalize">
                            <Code size={24} />
                            {lang} Templates
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Initial Code Template
                              </label>
                              <textarea
                                className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                value={form.initial_code[lang] || ""}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    initial_code: { ...form.initial_code, [lang]: e.target.value },
                                  })
                                }
                                placeholder={`Enter the initial code template for ${lang}...`}
                                rows={8}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Solution Code</label>
                              <textarea
                                className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                value={form.solution_code[lang] || ""}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    solution_code: { ...form.solution_code, [lang]: e.target.value },
                                  })
                                }
                                placeholder={`Enter the solution code for ${lang}...`}
                                rows={8}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Test Cases Section */}
                {activeSection === "tests" && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <TestTube size={24} />
                          Test Cases
                        </h3>
                        <button
                          type="button"
                          onClick={addTestCase}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          + Add Test Case
                        </button>
                      </div>

                      {form.test_cases.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <TestTube size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>No test cases added yet. Click "Add Test Case" to get started.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {form.test_cases.map((tc, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-gray-800">Test Case {i + 1}</h4>
                                <button
                                  type="button"
                                  onClick={() => removeTestCase(i)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                                  <textarea
                                    value={tc.input}
                                    onChange={(e) => handleTestCaseChange(i, "input", e.target.value)}
                                    placeholder="Enter test input..."
                                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expected Output
                                  </label>
                                  <textarea
                                    value={tc.output}
                                    onChange={(e) => handleTestCaseChange(i, "output", e.target.value)}
                                    placeholder="Enter expected output..."
                                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div className="mt-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={tc.hidden}
                                    onChange={(e) => handleTestCaseChange(i, "hidden", e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  Hidden Test Case
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hints & Schedule Section */}
                {activeSection === "hints" && (
                  <div className="space-y-6">
                    {/* Hints Section */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <Lightbulb size={24} />
                          Hints
                        </h3>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, hints: [...form.hints, ""] })}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          + Add Hint
                        </button>
                      </div>

                      {form.hints.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Lightbulb size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>No hints added yet. Click "Add Hint" to help users solve the challenge.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {form.hints.map((hint, index) => (
                            <div key={index} className="flex gap-3 items-start">
                              <div className="flex-1">
                                <input
                                  value={hint}
                                  onChange={(e) => handleArrayChange("hints", index, e.target.value)}
                                  placeholder={`Hint ${index + 1}`}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeHint(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Schedule Section */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <Clock size={24} />
                        Challenge Schedule
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Set the start and end times for when this challenge will be available (optional).
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                          <input
                            type="datetime-local"
                            name="start_time"
                            value={form.start_time}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                          <input
                            type="datetime-local"
                            name="end_time"
                            value={form.end_time}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
                  >
                    {isEdit ? "Update Challenge" : "Create Challenge"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateChallengeModal
