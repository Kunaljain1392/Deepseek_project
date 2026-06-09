import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import Image from 'next/image'
import React from 'react'
import toast from 'react-hot-toast'

const ChatLabel = ({ chat, openMenu, setOpenMenu }) => {

  const { fetchUserChats, setSelectedChat } = useAppContext()

  const selectChat = () => {
    setSelectedChat({
      ...chat,
      messages: chat.messages || [],
    });
  }

  const renameHandler = async () => {
    try {
      const newName = prompt('Enter new name')
      if (!newName) return

      const { data } = await axios.post('/api/chat/rename', {
        chatId: chat._id
      , name: newName
      })

      if (data.success) {
        fetchUserChats()
        setOpenMenu({ id: 0, open: false })
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteHandler = async () => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this chat?')
      if (!confirmDelete) return

      const { data } = await axios.post('/api/chat/delete', {
        chatId: chat._id
      })

      if (data.success) {
        fetchUserChats()
        setOpenMenu({ id: 0, open: false })
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div
      onClick={selectChat}
      className='flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer'
    >
      <p>{chat.name}</p>

      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu({
            id: chat._id,
            open: openMenu.id === chat._id ? !openMenu.open : true
          });
        }}
        className='group relative flex items-center justify-center h-6 w-6 hover:bg-black/80 rounded-lg'
      >

        <Image
          src={assets.three_dots}
          alt=''
          className={`w-4 ${
            openMenu.id === chat._id && openMenu.open ? '' : 'hidden'
          } group-hover:block`}
        />

        <div className={`${
          openMenu.id === chat._id && openMenu.open ? 'block' : 'hidden'
        } absolute -right-36 top-6 bg-gray-700 rounded-xl w-max p-2`}>

          <div onClick={renameHandler} className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg'>
            <Image src={assets.pencil_icon} alt='' className='w-4' />
            <p>Rename</p>
          </div>

          <div onClick={deleteHandler} className='flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg'>
            <Image src={assets.delete_icon} alt='' className='w-4' />
            <p>Delete</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ChatLabel