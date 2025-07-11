import axiosInstance from '@/api/axiosInstance'
import React, { useEffect, useState } from 'react'
import { DollarSign, Calendar, ArrowLeft, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/Components/Spinner'

function Premium() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const navigate = useNavigate()

    const RAZORPAY_KEY_ID = 'rzp_test_OdNxnDyzMRmvHL'

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true)
                const [PlansRes, SubscriptionRes] = await Promise.all([
                    axiosInstance.get("/premium/list/"),
                    axiosInstance.get('/premium/check-subscription/')
                ])
                setPlans(PlansRes.data)
                setIsSubscribed(SubscriptionRes.data.is_premium)
            } catch (err) {
                console.error("Error fetching plans ", err)
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 100);
            }
        }
        fetchPlans()
    }, [])


    const handlePremium = async (planId) => {
        try {
            const res = await axiosInstance.post('/premium/create-order/', { plan_id: planId })
            const { order_id, amount, currency, plan } = res.data

            const options = {
                key: RAZORPAY_KEY_ID,
                amount,
                currency,
                name: "Premium Subscription",
                description: plan.description,
                order_id,
                handler: async function (response) {
                    try {
                        await axiosInstance.post('/premium/verify/', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan_id: plan.id
                        })
                        navigate('/home')
                    } catch (err) {
                        console.error('verification failed', err)
                    }
                },
                prefill: {
                    name: "Your Name",
                    email: "you@example.com",
                },
                theme: {
                    color: "#6366F1"
                }
            }
            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (err) {
            console.error("Payment initiation failed", err);
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-black">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500 h-48 p-6">
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-slate-800/80 hover:bg-slate-700/80 text-white border-0 rounded-xl px-4 py-2 backdrop-blur-sm flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back</span>
                    </button>
                </div>


                <div className="flex flex-col items-center justify-center gap-6 h-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                        <Lock className="w-6 h-6 text-white" />
                    </div>


                    <div className="text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Upgrade to Premium</h1>
                        <p className="text-sm text-white/80">Unlock exclusive features and enhance your experience</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <div key={plan.id} className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                                <div className="mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{plan.duration_days} days</p>
                                </div>
                                {isSubscribed ? (
                                    <button className="w-full mt-4 px-4 py-3 bg-green-500 text-white rounded-lg font-medium cursor-not-allowed">
                                        Subscribed
                                    </button>
                                ) : (
                                    <button onClick={() => handlePremium(plan.id)} className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-md">
                                        Buy Now
                                    </button>
                                )}


                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Premium
