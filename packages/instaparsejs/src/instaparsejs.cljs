(ns instaparsejs
  (:require [instaparse.core :as insta]))

(defn parser_all [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (insta/parses p text)))))

(defn parser [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (insta/parse p text)))))

(defn spans_int [t]
  (if (sequential? t)
    {:tag (first t) :pos (insta/span t) :children (map spans_int (next t))}
    {:value t}))

(defn parser_pos [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (spans_int (insta/parse p text))))))

(defn parser_all_pos [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (map spans_int (insta/parses p text))))))
