(ns instaparsejs
  (:require [instaparse.core :as insta]))

(defn parser [grammar]
  (let [p (insta/parser grammar)] 
    (fn [text] (clj->js (p text)))))
