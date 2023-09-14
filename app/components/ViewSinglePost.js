import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import NotFound from "./NotFound";
import Axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { Tooltip } from "react-tooltip";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

export default function ViewSinglePost() {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const { id } = useParams();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: ourRequest.token
        });
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  if (!isLoading && !post) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  }
  const date = new Date(post.createdDate);
  const dateFormatted = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  }
  async function deleteHandler() {
    const areYouSure = window.confirm(
      "Do you really want to delete this post?"
    );
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: {
            token: appState.user.token
          }
        });
        if (response.data == "Success") {
          // Display a flash message
          appDispatch({
            type: "flashMessage",
            value: "Post was successfully deleted."
          });
          // Redirect back to the current user's profile
          navigate(`/profile/${appState.user.username}`);
        }
      } catch (error) {
        console.log("There was a problem.", error);
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tooltip-content="Edit"
              data-tooltip-id="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <Tooltip id="edit" class="custom-tooltip" />{" "}
            <a
              onClick={deleteHandler}
              className="delete-post-button text-danger"
              data-tooltip-content="Delete"
              data-tooltip-id="delete"
            >
              <i className="fas fa-trash"></i>
            </a>
            <Tooltip id="delete" class="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown
          children={post.body}
          allowElements={[
            "p",
            "br",
            "strong",
            "em",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "ol",
            "ul",
            "li"
          ]}
        />
      </div>
    </Page>
  );
}
