import axios from "axios";
const API_URL=import.meta.env.VITE_API_URL

const axiosInstance=axios.create({
    baseURL: API_URL,
    withCredentials:true,
})

axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response)=>response,
    async(error)=>{
        const originalRequest=error.config

        if(error.response?.status===401 && !originalRequest._retry){
            originalRequest._retry=true

            try{
                await axiosInstance.post('/refresh-token/')
                return axiosInstance(originalRequest)
            }catch(refreshError){
                const currentPath=window.location.pathname
                const isAdminRoute=currentPath.startsWith('/admin')

                if(isAdminRoute){
                    window.location.href='/adminlogin'
                }else{
                    window.location.href='/login'
                }
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance