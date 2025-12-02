'use client'
import axios from 'axios';
import React from 'react'
import { MdDeleteOutline } from "react-icons/md";

const RemoveFromSave = ({productId}) => {
    const removeSaveData = async () => {
        try {
            const response = await axios.delete('/api/user/addtosave', {data:{productId}, withCredentials:true})
            console.log(response)
            alert(response.data.message)
        } catch (error) {
            alert(error?.response?.data?.message)
            console.log(user)
        }
    }
  return (
    <MdDeleteOutline onClick={removeSaveData}  className='text-2xl cursor-pointer'/>
  )
}

export default RemoveFromSave
