-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler  version: 0.9.1-beta1
-- PostgreSQL version: 10.0
-- Project Site: pgmodeler.io
-- Model Author: ---


-- Database creation must be done outside an multicommand file.
-- These commands were put in this file only for convenience.
-- -- object: ritmo_cardiaco | type: DATABASE --
-- -- DROP DATABASE IF EXISTS ritmo_cardiaco;
-- CREATE DATABASE ritmo_cardiaco;
-- -- ddl-end --
-- 

-- object: public.patient | type: TABLE --
-- DROP TABLE IF EXISTS public.patient CASCADE;
CREATE TABLE public.patient(
	id serial NOT NULL,
	document varchar(11) NOT NULL,
	firstname varchar(50) NOT NULL,
	lastname varchar(50) NOT NULL,
	age integer NOT NULL,
	weight numeric(5,2) NOT NULL,
	height numeric(5,2) NOT NULL,
	CONSTRAINT pk_patient PRIMARY KEY (id),
	CONSTRAINT uq_document UNIQUE KEY (document)

);
-- ddl-end --
ALTER TABLE public.patient OWNER TO postgres;
-- ddl-end --

-- object: public.contact | type: TABLE --
-- DROP TABLE IF EXISTS public.contact CASCADE;
CREATE TABLE public.contact(
	id serial NOT NULL,
	patient integer NOT NULL,
	mail varchar(50) NOT NULL,
	phone varchar(10),
	address varchar(50),
	CONSTRAINT pk_contact PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.contact OWNER TO postgres;
-- ddl-end --

-- object: public.heart_rate_measurement | type: TABLE --
-- DROP TABLE IF EXISTS public.heart_rate_measurement CASCADE;
CREATE TABLE public.heart_rate_measurement(
	id serial NOT NULL,
	patient integer,
	value integer NOT NULL,
	time integer NOT NULL,
	date timestamp NOT NULL,
	CONSTRAINT pk_heart_rate_measurement PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.heart_rate_measurement OWNER TO postgres;
-- ddl-end --

-- object: public.diagnosis | type: TABLE --
-- DROP TABLE IF EXISTS public.diagnosis CASCADE;
CREATE TABLE public.diagnosis(
	id serial NOT NULL,
	patient integer,
	date timestamp NOT NULL,
	diagnosis text NOT NULL,
	CONSTRAINT pk_diagnosis PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.diagnosis OWNER TO postgres;
-- ddl-end --

-- object: patient_fk | type: CONSTRAINT --
-- ALTER TABLE public.contact DROP CONSTRAINT IF EXISTS patient_fk CASCADE;
ALTER TABLE public.contact ADD CONSTRAINT patient_fk FOREIGN KEY (patient)
REFERENCES public.patient (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: patient_fk | type: CONSTRAINT --
-- ALTER TABLE public.heart_rate_measurement DROP CONSTRAINT IF EXISTS patient_fk CASCADE;
ALTER TABLE public.heart_rate_measurement ADD CONSTRAINT patient_fk FOREIGN KEY (patient)
REFERENCES public.patient (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: patient_fk | type: CONSTRAINT --
-- ALTER TABLE public.diagnosis DROP CONSTRAINT IF EXISTS patient_fk CASCADE;
ALTER TABLE public.diagnosis ADD CONSTRAINT patient_fk FOREIGN KEY (patient)
REFERENCES public.patient (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --


