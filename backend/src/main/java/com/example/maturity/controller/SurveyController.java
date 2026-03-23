package com.example.maturity.controller;

import com.example.maturity.model.Survey;
import com.example.maturity.repository.SurveyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
@CrossOrigin(origins = "*") // For development
public class SurveyController {

    @Autowired
    private SurveyRepository surveyRepository;

    @GetMapping
    public List<Survey> getAllSurveys() {
        return surveyRepository.findAllByOrderBySubmittedAtDesc();
    }

    @PostMapping
    public Survey createSurvey(@RequestBody Survey survey) {
        return surveyRepository.save(survey);
    }
}
