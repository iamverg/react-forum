import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Axios from "axios";

// My Contexts
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// My Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import About from "./components/About";
import Terms from "./components/Terms";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";

Axios.defaults.baseURL = "http://localhost:8080";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("cAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("cAppToken"),
      username: localStorage.getItem("cAppUsername"),
      avatar: localStorage.getItem("cAppAvatar")
    }
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case "logout":
        draft.loggedIn = false;
        break;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        break;
      default:
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("cAppToken", state.user.token);
      localStorage.setItem("cAppUsername", state.user.username);
      localStorage.setItem("cAppAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("cAppToken");
      localStorage.removeItem("cAppUsername");
      localStorage.removeItem("cAppAvatar");
    }
  }, [state.loggedIn]);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route path="/profile/:username/*" element={<Profile />} />
            <Route
              path="/"
              element={state.loggedIn ? <Home /> : <HomeGuest />}
            />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
const root = ReactDOM.createRoot(document.getElementById("app"));

root.render(<Main />);

if (module.hot) {
  module.hot.accept();
}
