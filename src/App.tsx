import './App.css'
import Menu from './Menu' // Menu.txs
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getCopyright } from './components/Tool'; // Tool.txs
import Home from './components/Home' // Home.txs
import Signup from './components/member/Signup';
import Member_Find_all from './components/member/Member_Find_all';
import Member_Read from './components/member/Member_Read';
import Member_Update_password from './components/member/Member_Update_password';
import Member_Update from './components/member/Member_Update';
import Member_Delete from './components/member/Member_Delete';
import Member_Login from './components/member/Member_Login';
import Member_Logout from './components/member/Member_Logout';
import Auth from './components/Auth';
import Content from './components/content/Content';
import ContentList from './components/content/ContentList';
import ContentImage from './components/content/ContentImage';
import Post from './components/post/Post';
import PostRead from './components/post/PostRead';
import PostCreate from './components/post/PostCreate';
import PostUpdate from './components/post/PostUpdate';
import PostDelete from './components/post/PostDelete';
import Search from "./components/search/Search";
import FavoriteList from "./components/favorite/FavoriteList"
import MyPage from './components/member/MyPage';
import MyReviewList from './components/member/MyReviewList';
import MyReplyList from './components/member/MyReplyList';
import AiRecommend from './components/ai/AiRecommend';


function App() {

  return (
    <BrowserRouter>
      <div style={{ width: '100%' }}>
        <Menu />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/member/signup' element={<Signup />} />
          <Route path='/member/find_all' element={<Member_Find_all />} />
          <Route path='/member/read/:memberno' element={<Member_Read />} />
          <Route path='/member/update_password' element={<Member_Update_password />} />
          <Route path='/member/update/:memberno' element={<Member_Update />} />
          <Route path='/member/delete/:memberno' element={<Member_Delete />} />
          <Route path='/member/login' element={<Member_Login />} />
          <Route path='/member/logout' element={<Member_Logout />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/content/content' element={<Content />} />
          <Route path='/content/list/:district' element={<ContentList />} />
          <Route path="/content/image/:contentno" element={<ContentImage />} />
          <Route path='/post/list/:contentno' element={<Post />} />
          <Route path="/post/read/:postno" element={<PostRead />} />
          <Route path="/post/create/:contentno" element={<PostCreate />} />
          <Route path="/post/update/:postno" element={<PostUpdate />} />
          <Route path="/post/delete/:postno" element={<PostDelete />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorite/list" element={<FavoriteList />} />
          <Route path="/member/mypage" element={<MyPage />} />
          <Route path="/member/my-reviews" element={<MyReviewList />} />
          <Route path="/member/my-replies" element={<MyReplyList />}/>
          <Route path="/ai/recommend" element={<AiRecommend />} />
        </Routes>
        <div className='copyright'>{getCopyright()}</div>
      </div>
    </BrowserRouter >


  )
}

export default App