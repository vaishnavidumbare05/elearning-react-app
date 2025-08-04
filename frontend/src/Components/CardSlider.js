import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from "react-router-dom";


const CardSlider = () => {
  const navigate = useNavigate();


  const cards = [
    {
      title: 'Python Advanced',
      text: 'Learn advanced Python concepts with hands-on projects.',
      duration: ' 1 years ・ Online',
      imgSrc: require('../img/Python.jpg'), // Adjust the path as necessary
    },
    {
      title: 'Web Developement ',
      text: 'Learn to build full-stack web applications.',
      duration: '6 Months ・ Online',
      imgSrc: require('../img/mern-stack.jpg'), // Adjust the path as necessary
    },
    {
      title: 'Python Beginner',
      text: 'Learn the basics of Python programming .',
      duration: '1 years ・ Online',
      imgSrc: require('../img/Python.jpg'), // Adjust the path as necessary
    },
    {
      title: 'HTML/CSS/JavaScript',
      text: 'Interactive web project using HTML, CSS, and JavaScript .',
      duration: '2 years ・ Online',
      imgSrc: require('../img/mern-stack.jpg'), // Adjust the path as necessary
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Show 3 cards at a time
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2, // Show 2 cards on medium screens
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1, // Show 1 card on small screens
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="card-frame" style={{ width: '100%', maxWidth: '1100px', margin: 'auto' }}>
      <Slider {...settings}>
        {cards.map((card, index) => (
          <div className="degree-card" key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }}>
            <div className="degree-card-img-wrapper">
              <span className="badge bg-warning text-dark sponsored-badge">SPONSORED</span>
              <img src={card.imgSrc} className="degree-card-img-top" alt={card.title} style={{ width: '100%', height: 'auto' }} />
            </div>
            <div className="degree-card-body">
              <h5 className="degree-card-title">{card.title}</h5>
              <p className="degree-card-text">{card.text}</p>
             
             {/* Enroll button */}
             <div class="d-flex justify-content-center">
             <button
  className="btn btn-primary mb-2 mt-2"
  style={{ width: '120px' }}
  onClick={() => navigate('/courses')}  // Navigate to /courses
 
>
  Enroll
</button>
                                        </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CardSlider;
