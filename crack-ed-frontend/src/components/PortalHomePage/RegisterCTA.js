import React from "react";
import './Curriculum.css';
import interviewDiscussionImg from './interview-discussion.png';

export const RegisterCTA = () => (
  <section className="bg-purple-50 py-5">
    <div className="container">
      <div className="row g-4 align-items-center">
        <div className="col-md-6">
          <div className="rounded overflow-hidden shadow">
            <img
              src={interviewDiscussionImg}
              alt="Interview discussion"
              className="img-fluid w-100 h-100 object-fit-cover"
            />
          </div>
        </div>
        <div className="col-md-6">
          <h2 className="h5 fw-bold mb-3">Why Choose This Program?</h2>
          <ul className="small text-secondary ps-3">
            <li className="mb-2">
              The Aurum Bankers Program is a 6-month course that offers a stipend of Rs 10,000 during your learning journey.
            </li>
            <li className="mb-2">
              With a focus on real-world experience, the program combines practical lessons and hands-on learning to help you grow.
            </li>
            <li className="mb-2">
              On successfully completing the program, you’ll have the chance to get job placement opportunities at Aurum Bank with a CTC of Rs 3.5 LPA.
            </li>
            <li>
              The Aurum Bankers Program provides you with the skills and knowledge you need to make a smooth transition into the corporate world.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);
