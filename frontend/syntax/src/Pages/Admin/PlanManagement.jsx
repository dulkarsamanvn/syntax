import axiosInstance from "@/api/axiosInstance"
import AdminSideBar from "@/Components/AdminSideBar"
import ConfirmModal from "@/Components/ConfirmModal"
import { Plus, Edit, Ban,Calendar, DollarSign, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

function PlanManagement() {
  const [plans, setPlans] = useState([])
  const [isEdit,setIsEdit]=useState(false)
  const [editPlanData,setEditPlanData]=useState(null)
  const [showModal, setShowModal] = useState(false)
  const [message,setMessage]=useState({type:'',text:''})
  const [blockModal,setBlockModal]=useState(false)
  const [selectedPlan,setSelectedPlan]=useState(null)
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    duration_days: "",
  })

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axiosInstance.get("/premium/list/")
        setPlans(res.data)
      } catch (err) {
        console.error("Error fetching plans ", err)
      }
    }
    fetchPlans()
  }, [])

  const handleCreatePlan = async () => {
    const {name,description,price,duration_days}=newPlan
    if (!name.trim() || !description.trim() || !price || !duration_days) {
      setMessage({ type: "error", text: "All fields are required." })
      return
    }

    if (parseFloat(price) <= 0) {
      setMessage({ type: "error", text: "Price must be greater than 0." })
      return
    }

    if (parseInt(duration_days) <= 0) {
      setMessage({ type: "error", text: "Duration must be at least 1 day." })
      return
    }

    try {
      if(isEdit && editPlanData){
        const res=await axiosInstance.put(`/premium/${editPlanData.id}/update/`,newPlan)
        setPlans((prev)=>
        prev.map((p)=>(p.id===editPlanData.id ? res.data:p)))
        setMessage({ type: "success", text: "Plan updated successfully." })
      }else{
        const res = await axiosInstance.post("/premium/create/", newPlan)
        setPlans((prev) => [...prev, res.data])
        setMessage({ type: "success", text: "Plan created successfully." })
      }
      setShowModal(false)
      setNewPlan({ name: "", description: "", price: "", duration_days: "" })
      setIsEdit(false)
      setEditPlanData(null)
    } catch (err) {
      console.error("error creating plan", err)
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    }
  }

  const handleEditPlan = (planId) => {
    const planToEdit=plans.find((p)=>p.id===planId)
    if(planToEdit){
      setIsEdit(true)
      setEditPlanData(planToEdit)
      setNewPlan(planToEdit)
      setShowModal(true)
    }
  }

  const openModal=(plan)=>{
    setSelectedPlan(plan)
    setBlockModal(true)
  }

  const handleBanPlan = async () => {
    if(!selectedPlan) return 

    const planId=selectedPlan.id
    const currentStatus=selectedPlan.is_active
    try{
      const res=await axiosInstance.patch(`/premium/${planId}/block/`,
       {is_active:!currentStatus}
      )
      toast.success(res.data.message || `Plan ${!currentStatus ? "activated" : "deactivated"} successfully`)
      setPlans(prevPlans=>
        prevPlans.map((plan)=>
          plan.id===planId ? {...plan,is_active:!currentStatus}:plan
        )
      )
      setSelectedPlan(null)
      setBlockModal(false)
    }catch(err){
      toast.error('failed to update group status')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Plans Management</h1>
              <p className="text-slate-400">Manage and create premium subscription plans</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-800 rounded-xl p-6 text-white border border-slate-600 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditPlan(plan.id)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit Plan"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() =>openModal(plan)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Ban Plan"
                    >
                      {plan.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                      
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{plan.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-2xl font-bold text-white">₹{plan.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">{plan.duration_days} days duration</span>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{isEdit ? 'Update Plan' : 'Create New Plan'}</h3>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {message.text && (
                    <div
                      className={`text-sm font-medium px-4 py-2 rounded-md ${
                        message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                    <input
                      type="text"
                      placeholder="Enter plan name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      placeholder="Enter plan description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                      <input
                        type="number"
                        placeholder="30"
                        value={newPlan.duration_days}
                        onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setIsEdit(false)
                      setEditPlanData(null)
                      setNewPlan({ name: "", description: "", price: "", duration_days: "" })
                      setMessage({ type: "", text: "" })
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
                  >
                    {isEdit?'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <ConfirmModal
          show={blockModal}
          onClose={()=>setBlockModal(false)}
          onConfirm={handleBanPlan}
          actionText={`Are you sure you want to ${selectedPlan?.is_active ? "block" : "unblock"} this plan?`}
        />
    </div>
  )
}

export default PlanManagement
