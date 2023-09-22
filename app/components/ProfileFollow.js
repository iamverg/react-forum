import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

export default function ProfileFollow({ action }) {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/${action}`, {
          cancelToken: ourRequest.token
        });

        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("There was a problem.");
      }
    }
    fetchPosts();
    return () => {
      ourRequest.cancel();
    };
  }, [action]);
  if (isLoading) {
    return <LoadingDotsIcon />;
  }
  if (posts.length === 0 && action === "followers") {
    return <p>You do not have any followers.</p>;
  }
  if (posts.length === 0 && action === "following") {
    return <p>You do not follow anybody. How about you follow you Dog.</p>;
  }
  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} />
            {follower.username}
          </Link>
        );
      })}
    </div>
  );
}
