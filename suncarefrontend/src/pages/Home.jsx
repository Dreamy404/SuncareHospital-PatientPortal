import React, { useEffect, useRef, useState } from "react";
import {
  Navbar,
  Footer
} from '../component';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context";
import { toast } from "react-toastify";


const Home = () => {
  const navigate = useNavigate();
  const { authState, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const toastId = useRef(null);
  const [reviews, setReviews] = useState([]);


  const HeroSection = () => {
    return (
      <div className="hero-container">
        <div className="hero-content">
          <div className="name-container">
            <img src="/bacgroundless.png" height={100} width={120} />
            <h1 className="hospital-name">Suncare Hospital</h1>
          </div>
          <p className="name-moto">You Trustworthy Partner in every Healthcare need</p>
          <button className="home-apt-btn btn" onClick={() => {
            navigate("/appointment");
          }}>Book Appointment Now</button>
        </div>
      </div>
    );
  };

  const MottoContainer = ({ overviewMsg, detailMsg, icon, float, motto }) => {
    return (
      <div className={`motto-container ${float}`}>
        <div className="overview-container">
          <div className="motto-logo">
            {icon}
          </div>
          <div className="motto-overview">
            <p>
              {overviewMsg}
            </p>
          </div>
        </div>
        <div className="detail-container">
          <h2 className="motto">{motto}</h2>
          {detailMsg}
        </div>
      </div>
    )
  }

  useEffect(() => {
    const getReviews = async () => {
      if (authState.isLoggedIn) {
        try {
          const response = await fetch(`suncarehospital/review/all/${user.user_id}`);
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setReviews(data);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const response = await fetch('suncarehospital/review/all');

          if (response.ok) {
            const data = await response.json();
            setReviews(data);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    getReviews();

  }, [user?.user_id]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    toastId.current = toast.info('Submitting...');
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/suncarehospital/review/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setTimeout(() => {
          toast.update(toastId.current, {
            render: "Succesfully Submitted!",
            type: "success",
            autoClose: 500,
            onClose: () => {
              setReviews(prevState => {
                return [
                  ...prevState.filter(review => review.user_id != user.user_id),
                  {
                    name: user.patient_name,
                    user_id: user.user_id,
                    comment: data.comment,
                    rating: data.rating
                  }
                ]
              });
            }
          });
        }, 1000);
      } else {
        const data = await response.json();
        setTimeout(() => {
          toast.update(toastId.current, {
            render: data.msg,
            type: "warning",
            autoClose: 500,
          });
        }, 1000);
      }
    } catch (error) {
      setTimeout(() => {
        toast.update(toastId.current, {
          render: "Submission Failed!",
          type: "warning",
          autoClose: 500,
        });
      }, 1000);
      console.log(error);
    }

    setSubmitting(false);

  }


  return (
    <>
      <Navbar />
      <main className="home-page">
        <HeroSection />
        <div className="home-container">
          <MottoContainer
            overviewMsg={"Our team of board-certified physicians and specialists bring decades of experience and expertise to provide you with the highest quality medical care. Every doctor on our staff is committed to staying current with the latest medical advances and best practices."}
            detailMsg={`Our medical professionals undergo rigorous training and continuous education to ensure they deliver exceptional care. From emergency medicine to specialized treatments, our doctors combine clinical excellence with compassionate patient care.
  
  We carefully select our medical staff based on their credentials, experience, and commitment to patient-centered care. Each physician is dedicated to building lasting relationships with patients and their families, ensuring personalized treatment plans that address your unique health needs.`}
            icon={<i className="fa-solid fa-user-doctor motto-icon"></i>}
            float={"right"}
            motto={"World Class Doctors"}
          />

          <MottoContainer
            overviewMsg={"Trust is the foundation of quality healthcare. We earn your confidence through transparent communication, evidence-based treatment decisions, and a commitment to putting your health and wellbeing first in everything we do."}
            detailMsg={`Building trust means being honest about your condition, explaining treatment options clearly, and respecting your right to make informed decisions about your care. We maintain the highest standards of medical ethics and patient confidentiality.
  
  Our reputation is built on decades of reliable service to our community. We understand that choosing a healthcare provider is a deeply personal decision, and we're honored when patients place their trust in our hands. Every interaction is guided by integrity, respect, and genuine care for your wellbeing.`}
            icon={<i className="fa-solid fa-handshake-angle motto-icon"></i>}
            float={"left"}
            motto={"Trust"}
          />

          <MottoContainer
            overviewMsg={"We provide comprehensive healthcare services designed to meet all your medical needs under one roof. From preventive care and routine check-ups to specialized treatments and emergency services, we're here for you at every stage of life."}
            detailMsg={`Our full-service approach means you can access primary care, specialty consultations, diagnostic imaging, laboratory services, and surgical procedures all in one convenient location. We coordinate care across departments to ensure seamless treatment.
  
  Whether you need routine wellness care, management of chronic conditions, or complex medical procedures, our integrated healthcare system provides continuity of care. We focus on prevention, early detection, and personalized treatment plans to help you achieve optimal health outcomes.`}
            icon={<i className="fa-solid fa-stethoscope motto-icon"></i>}
            float={"right"}
            motto={"Best Healthcare Services"}
          />

          <MottoContainer
            overviewMsg={"We invest in the latest medical technology and equipment to ensure accurate diagnoses and effective treatments. Our state-of-the-art facilities feature advanced imaging systems, minimally invasive surgical tools, and innovative treatment options."}
            detailMsg={`From robotic surgery systems to advanced MRI and CT scanners, we utilize cutting-edge technology to provide precise, efficient care. Our electronic health records system ensures seamless communication between your care team and immediate access to your medical information.
  
  We continuously upgrade our technology to stay at the forefront of medical innovation. This includes telemedicine capabilities, advanced monitoring systems, and the latest in diagnostic equipment. Our commitment to technological advancement means you receive the most effective, least invasive treatments available.`}
            icon={<i className="fa-solid fa-microchip motto-icon"></i>}
            float={"left"}
            motto={"Cutting Edge Medical Technology"}
          />
        </div>
        <div className="review-system">
          <ul className="review-container">
            {reviews.map((review) => (<ReviewItem key={review.name} name={review.name} comment={review.comment} rating={review.rating} />))}
          </ul>
          <div className="review-box" hidden={!authState.isLoggedIn}>
            <form id="review-form" onSubmit={handleReviewSubmit} className="review-form">
              <div class="star-rating">
                <input type="radio" name="rating" id="star5" value="5" /><label for="star5">★</label>
                <input type="radio" name="rating" id="star4" value="4" /><label for="star4">★</label>
                <input type="radio" name="rating" id="star3" value="3" /><label for="star3">★</label>
                <input type="radio" name="rating" id="star2" value="2" /><label for="star2">★</label>
                <input type="radio" name="rating" id="star1" value="1" /><label for="star1">★</label>
              </div>
              <textarea name="comment" placeholder="Leave a comment..."></textarea>
              <button type="submit" disabled={submitting}>Submit</button>
            </form>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const ReviewItem = ({ name, comment, rating }) => {
  return (
    <>
      <li className="review-holder">
        <div className="profile-shower">
          <div className="name-logo"><p>{name[0]}</p></div>
          <div className="name-full">{name}</div>
        </div>
        <div className="stars">
          {[...Array(Number(rating))].map((_, i) => (
            <span key={i}><i className="fa-solid fa-star"></i></span>
          ))}
        </div>
        <div className="comment">
          {comment}
        </div>
      </li>
    </>
  );
};

export default Home;