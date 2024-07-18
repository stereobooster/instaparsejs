(ns instaparsejs
  (:require [instaparse.core :as insta]))

(defn parses [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (insta/parses p text)))))

(defn parse [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (insta/parse p text)))))

(defn spans_int [t]
  (if (sequential? t)
    {:tag (first t) :pos (insta/span t) :children (map spans_int (next t))}
    {:value t}))

(defn span [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (spans_int (insta/parse p text))))))

(defn spans [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (map spans_int (insta/parses p text))))))
