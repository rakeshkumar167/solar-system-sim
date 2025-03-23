package com.solarsystem.model;

import lombok.Data;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@Data
public class CelestialBody {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private double radius;  // in km
    private double orbitRadius; // in millions of km
    private double rotationPeriod; // in Earth days
    private double orbitPeriod; // in Earth days
    private String textureUrl;
}